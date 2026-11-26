import os
import asyncio
import logging
import time
import unicodedata
import httpx

from datetime import datetime, timezone
from fastapi import HTTPException
from core.schemas import UbicacionOut

logger = logging.getLogger(__name__)

BASE_URL = "https://app.ticketmaster.com/discovery/v2"
INTERVALO_SOLICITUDES = 0.21
RADIO_DEFAULT_KM = 50
GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"

def normalizar_nombre(nombre: str) -> str:
    """Normaliza un nombre para comparar artistas de spotify con los de ticketmaster,
        esto porque los id's de los artistas son diferentes en cada API, asi que
        debemos obtener los id's de ticketmaster"""

    nombre = unicodedata.normalize("NFKD", nombre)
    nombre = "".join(c for c in nombre if not unicodedata.combining(c))
    nombre = nombre.casefold()

    return " ".join("".join(c if c.isalnum() else " " for c in nombre).split())


def generar_geohash(lat: float, lon: float, precision: int = 7) -> str:
    """Convierte las coordenadas en un geohash.
        Porque en ticketmaster se necesita geoPoint, ya que quedo obsoleto latlong"""

    lat_min, lat_max = -90.0, 90.0
    lon_min, lon_max = -180.0, 180.0

    resultado = []
    valor = 0
    bits = 0
    bit_longitud = True

    while len(resultado) < precision:

        if bit_longitud:
            medio = (lon_min + lon_max) / 2

            if lon >= medio:
                valor = (valor << 1) | 1
                lon_min = medio
            else:
                valor <<= 1
                lon_max = medio
        else:
            medio = (lat_min + lat_max) / 2

            if lat >= medio:
                valor = (valor << 1) | 1
                lat_min = medio
            else:
                valor <<= 1
                lat_max = medio

        bit_longitud = not bit_longitud
        bits += 1

        if bits == 5:
            resultado.append(GEOHASH_BASE32[valor])
            valor = 0
            bits = 0

    return "".join(resultado)


class TicketmasterService:
    """
    Servicio encargado de buscar eventos en Ticketmaster.
    """

    @staticmethod
    def _validar_respuesta(
        respuesta: httpx.Response,
        operacion: str
    ) -> None:
        """Valida las respuestas de Ticketmaster."""

        if respuesta.status_code == 200:
            return

        parametros = {
            k: v
            for k, v in respuesta.request.url.params.items()
            if k.lower() != "apikey"
        }

        logger.error(
            "Ticketmaster | Operación: %s | HTTP: %s | "
            "Parámetros: %s | Respuesta: %s",
            operacion,
            respuesta.status_code,
            parametros,
            respuesta.text[:2000]
        )

        if respuesta.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail="Ticketmaster rechazó las credenciales."
            )

        if respuesta.status_code == 429:
            espera = respuesta.headers.get("Retry-After", "60")

            raise HTTPException(
                status_code=503,
                detail="Se alcanzó el límite de solicitudes de Ticketmaster.",
                headers={"Retry-After": espera}
            )

        raise HTTPException(
            status_code=502,
            detail=f"Error consultando Ticketmaster: {operacion}."
        )

    @staticmethod
    async def _esperar_limite(ultima_solicitud: float) -> None:
        """Para evitar realizar solicitudes demasiado seguidas."""

        if ultima_solicitud:
            transcurrido = time.monotonic() - ultima_solicitud
            espera = INTERVALO_SOLICITUDES - transcurrido

            if espera > 0:
                await asyncio.sleep(espera)

    @staticmethod
    def _obtener_parametros_cercanos(
        ubicacion: UbicacionOut
    ) -> dict:
        """Prepara los parametros geograficos de Ticketmaster, 
            mapea los datos que da la implementacion de la ip_api a un geohash"""

        lat = ubicacion.lat
        lon = ubicacion.lon

        if lat is None or lon is None:
            raise HTTPException(
                status_code=422,
                detail="No se pudieron obtener las coordenadas del usuario."
            )

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise HTTPException(
                status_code=422,
                detail="Las coordenadas de ubicación no son validas."
            )

        return {
            "geoPoint": generar_geohash(lat, lon),
            "radius": str(ubicacion.radio_km or RADIO_DEFAULT_KM),
            "unit": "km"
        }

    @staticmethod
    async def _buscar_ids_artistas(
        client: httpx.AsyncClient,
        api_key: str,
        artistas: list[dict]
    ) -> tuple[dict, float]:

        """Busca los artistas en Ticketmaster y relaciona sus id's con sus nombres e imagenes"""

        artistas_por_id = {}
        nombres_consultados = set()
        ultima_solicitud = 0.0

        for artista in artistas:

            nombre = (artista.get("nombre") or "").strip()

            if not nombre:
                continue

            nombre_normalizado = normalizar_nombre(nombre)

            if not nombre_normalizado:
                continue

            if nombre_normalizado in nombres_consultados:
                continue

            nombres_consultados.add(nombre_normalizado)

            await TicketmasterService._esperar_limite(ultima_solicitud)

            respuesta = await client.get(
                f"{BASE_URL}/attractions.json",
                params={
                    "apikey": api_key,
                    "keyword": nombre,
                    "size": 20
                }
            )

            ultima_solicitud = time.monotonic()

            TicketmasterService._validar_respuesta(respuesta, f"búsqueda del artista {nombre}")

            datos = respuesta.json()

            atracciones = (datos.get("_embedded", {}).get("attractions", []))

            coincidencia = None

            for atraccion in atracciones:

                nombres_ticketmaster = [atraccion.get("name", "")]

                nombres_ticketmaster.extend(atraccion.get("aliases") or [])

                coincide = any(
                    normalizar_nombre(n) == nombre_normalizado
                    for n in nombres_ticketmaster
                    if isinstance(n, str)
                )

                if not coincide:
                    continue

                clasificaciones = atraccion.get("classifications", [])

                if clasificaciones:
                    es_musica = any(
                        (c.get("segment") or {})
                        .get("name", "").casefold() == "music"
                        for c in clasificaciones
                    )

                    if not es_musica:
                        continue

                coincidencia = atraccion
                break

            if not coincidencia:
                logger.info("No se encontró una coincidencia para %s", nombre)
                continue

            id_ticketmaster = coincidencia.get("id")

            if id_ticketmaster:
                imagen = artista.get("imagen_url")

                if not imagen:
                    imagenes = coincidencia.get("images", [])

                    imagen = next(
                        (
                            img.get("url")
                            for img in imagenes
                            if img.get("url")
                        ),
                        None
                    )

                artistas_por_id[id_ticketmaster] = {
                    "nombre": nombre,
                    "imagen_url": imagen
                }

        return artistas_por_id, ultima_solicitud

    @staticmethod
    def _formatear_eventos(
        eventos: list[dict],
        artistas_por_id: dict
    ) -> list[dict]:
        """Transforma los eventos a un formato mas ordenado y
            solamente con lo necesario para GigMatch."""

        conciertos = []
        eventos_procesados = set()

        for evento in eventos:
            id_evento = evento.get("id")

            if not id_evento or id_evento in eventos_procesados:
                continue

            embedded = evento.get("_embedded", {})
            atracciones = embedded.get("attractions", [])
            artistas_evento = []

            for atraccion in atracciones:
                artista = artistas_por_id.get(atraccion.get("id"))
                if artista and artista not in artistas_evento:
                    artistas_evento.append(artista)

            if not artistas_evento:
                continue

            eventos_procesados.add(id_evento)

            inicio = (evento.get("dates", {}).get("start", {}))

            fecha = (inicio.get("dateTime") or inicio.get("localDate"))

            recintos = embedded.get("venues", [])
            recinto = recintos[0] if recintos else {}

            ciudad = (recinto.get("city") or {}).get("name")

            nombres = list(dict.fromkeys(
                a["nombre"] for a in artistas_evento
            ))

            imagen = next(
                (
                    a["imagen_url"]
                    for a in artistas_evento
                    if a.get("imagen_url")
                ),
                None
            )

            conciertos.append({
                "id_ticketmaster": id_evento,
                "titulo": evento.get("name", "Concierto sin título"),
                "artista": ", ".join(nombres),
                "fecha": fecha,
                "recinto": recinto.get("name"),
                "ciudad": ciudad,
                "imagen_artista": imagen,
                "url_compra": evento.get("url")
            })

        return conciertos

    @staticmethod
    async def _buscar_eventos_artistas(
        artistas: list[dict],
        parametros_ubicacion: dict
    ) -> list[dict]:
        """Busca los eventos de los artistas aplicando un filtro de ubicación."""

        if not artistas:
            return []

        api_key = os.getenv("TICKETMASTER_CONSUMER_KEY")

        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="No se configuró TICKETMASTER_CONSUMER_KEY."
            )

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:

                # Identificar los artistas en Ticketmaster.
                artistas_por_id, ultima_solicitud = (
                    await TicketmasterService._buscar_ids_artistas(
                        client,
                        api_key,
                        artistas
                    )
                )

                if not artistas_por_id:
                    return []

                fecha_actual = datetime.now(timezone.utc).strftime(
                    "%Y-%m-%dT%H:%M:%SZ"
                )

                parametros = {
                    "apikey": api_key,
                    "attractionId": ",".join(artistas_por_id.keys()),
                    "source": "ticketmaster",
                    "startDateTime": fecha_actual,
                    "sort": "date,asc",
                    "size": 100
                }

                parametros.update(parametros_ubicacion)

                await TicketmasterService._esperar_limite(
                    ultima_solicitud
                )

                respuesta = await client.get(
                    f"{BASE_URL}/events.json",
                    params=parametros
                )

                TicketmasterService._validar_respuesta(
                    respuesta,
                    "búsqueda de eventos"
                )

                datos = respuesta.json()

                eventos = (
                    datos.get("_embedded", {})
                    .get("events", [])
                )

                return TicketmasterService._formatear_eventos(
                    eventos,
                    artistas_por_id
                )

        except httpx.RequestError as error:
            logger.error(
                "Error de conexión con Ticketmaster: %s",
                error,
                exc_info=True
            )

            raise HTTPException(
                status_code=502,
                detail="No se pudo establecer conexión con Ticketmaster."
            ) from error

    @staticmethod
    async def obtener_eventos_por_pais(
        artistas: list[dict],
        ubicacion: UbicacionOut
    ) -> list[dict]:
        """Busca eventos de los artistas en el pais detectado."""

        if not ubicacion.codigo_pais:
            raise HTTPException(
                status_code=422,
                detail="No se pudo determinar el país del usuario."
            )

        return await TicketmasterService._buscar_eventos_artistas(artistas,
            {
                "countryCode": ubicacion.codigo_pais.upper()
            }
        )

    @staticmethod
    async def obtener_eventos_cercanos(
        artistas: list[dict],
        ubicacion: UbicacionOut
    ) -> list[dict]:
        """Busca eventos dentro del radio de la ubicacion."""

        parametros = (
            TicketmasterService._obtener_parametros_cercanos(ubicacion)
        )

        return await TicketmasterService._buscar_eventos_artistas(artistas, parametros)