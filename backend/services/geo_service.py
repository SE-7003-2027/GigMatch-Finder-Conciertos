import ipaddress
import logging
import time

import geonamescache
import httpx
import pycountry
from fastapi import HTTPException, status

from core.schemas import CiudadOut, PaisOut, UbicacionOut

logger = logging.getLogger(__name__)

IP_API_URL: str = "http://ip-api.com/json/"  
IP_API_FIELDS: str = "status,message,country,countryCode,city,lat,lon"
CACHE_TTL_SEGUNDOS: int = 3600  # Evita gastar el límite de 45 peticiones/min por IP
MIN_POBLACION_CIUDAD: int = 15000

RADIO_MIN_KM: int = 10
RADIO_MAX_KM: int = 100  
RADIO_DEFAULT_KM: int = 40

_cache: dict[str, tuple[float, UbicacionOut]] = {}
_gc: geonamescache.GeonamesCache = geonamescache.GeonamesCache()
_ciudades_por_pais: dict[str, list[dict]] | None = None


def _es_ip_publica(ip: str | None) -> bool:
    """False para IPs vacías, loopback o privadas (desarrollo local)."""
    if not ip:
        return False
    try:
        return ipaddress.ip_address(ip).is_global
    except ValueError:
        return False


def _formatear_latlong(lat: float | None, lon: float | None) -> str | None:
    """Formato 'lat,long' que espera el parámetro latlong de Ticketmaster."""
    if lat is None or lon is None:
        return None
    return f"{lat},{lon}"


def _con_radio(ubicacion: UbicacionOut, radio_km: int) -> UbicacionOut:
    """
    Agrega el radio de búsqueda (km). Solo tiene sentido con coordenadas;
    con solo país se filtra por countryCode y no hay radio.
    Devuelve una copia porque la ubicación original puede venir del caché.
    """
    return ubicacion.model_copy(
        update={"radio_km": radio_km if ubicacion.latlong else None}
    )


def _indexar_ciudades() -> dict[str, list[dict]]:
    """Agrupa las ciudades de geonamescache por código de país (una sola vez)."""
    global _ciudades_por_pais
    if _ciudades_por_pais is None:
        indice: dict[str, list[dict]] = {}
        for c in _gc.get_cities().values():
            if c["population"] < MIN_POBLACION_CIUDAD:
                continue
            indice.setdefault(c["countrycode"], []).append(c)
        for lista in indice.values():
            lista.sort(key=lambda c: c["population"], reverse=True)
        _ciudades_por_pais = indice
    return _ciudades_por_pais


class GeoService:
    """
    Servicio de contexto y geolocalización (EPIC-02).

    * Detecta la ubicación del usuario a partir de su IP (IP-API).
    * Permite cambiar manualmente de país/ciudad usando pycountry y
      geonamescache, entregando datos válidos para Ticketmaster.
    """

    @staticmethod
    async def detectar_por_ip(
        ip: str | None, radio_km: int = RADIO_DEFAULT_KM
    ) -> UbicacionOut:
        """
        Consulta IP-API y devuelve país, ciudad, coordenadas y radio de búsqueda.

        Si la IP es local/privada (desarrollo), se consulta sin IP para que
        IP-API use la IP pública desde la que sale el servidor.
        """
        ip_consulta = ip if _es_ip_publica(ip) else ""
        clave = ip_consulta or "self"

        # Si ya está en caché y no expiró, se devuelve la ubicación guardada
        en_cache = _cache.get(clave)
        if en_cache and time.time() - en_cache[0] < CACHE_TTL_SEGUNDOS:
            return _con_radio(en_cache[1], radio_km)

        try:
            async with httpx.AsyncClient(timeout=5) as client:
                res = await client.get(
                    f"{IP_API_URL}{ip_consulta}", params={"fields": IP_API_FIELDS}
                )
        except httpx.RequestError as e:
            logger.error("No se pudo contactar a IP-API: %s", e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="No se pudo contactar a IP-API.",
            ) from e

        if res.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            # X-Ttl: segundos hasta que se reinicie el límite
            espera = res.headers.get("X-Ttl", "60")
            logger.warning("Límite de IP-API excedido; reintentar en %s s", espera)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Límite de peticiones a IP-API excedido. Intenta más tarde.",
                headers={"Retry-After": espera},
            )
        if res.status_code == status.HTTP_400_BAD_REQUEST:
            logger.error("IP-API respondió 400: %s", res.text)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Petición inválida a IP-API.",
            )
        if res.status_code != status.HTTP_200_OK:
            logger.error("IP-API respondió %s: %s", res.status_code, res.text)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Error inesperado en IP-API.",
            )

        # Analiza la respuesta JSON de IP-API
        data: dict = res.json()
        if data.get("status") != "success":
            mensaje = data.get("message", "desconocido")
            logger.warning("IP-API no pudo localizar la IP: %s", mensaje)
            raise HTTPException(
                status_code=422,  # Unprocessable: la IP no es localizable
                detail=f"IP-API no pudo localizar la IP: {mensaje}",
            )

        ubicacion = UbicacionOut(
            codigo_pais=data["countryCode"],
            pais=data.get("country"),
            ciudad=data.get("city"),
            lat=data.get("lat"),
            lon=data.get("lon"),
            latlong=_formatear_latlong(data.get("lat"), data.get("lon")),
            origen="ip",
        )
        _cache[clave] = (time.time(), ubicacion)
        logger.info("Ubicación detectada por IP: %s", ubicacion.codigo_pais)
        return _con_radio(ubicacion, radio_km)

    @staticmethod
    def listar_paises() -> list[PaisOut]:
        """Países con su código ISO de 2 letras (el que pide Ticketmaster)."""
        paises = [PaisOut(codigo=p.alpha_2, nombre=p.name) for p in pycountry.countries]
        return sorted(paises, key=lambda p: p.nombre)

    @staticmethod
    def listar_ciudades(codigo_pais: str, limite: int = 50) -> list[CiudadOut]:
        """Ciudades más pobladas de un país, con coordenadas."""
        codigo = codigo_pais.upper()
        if not pycountry.countries.get(alpha_2=codigo):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Código de país no válido.",
            )
        ciudades = _indexar_ciudades().get(codigo, [])[:limite]
        return [
            CiudadOut(nombre=c["name"], lat=c["latitude"], lon=c["longitude"])
            for c in ciudades
        ]

    @staticmethod
    def resolver_ubicacion_manual(
        codigo_pais: str,
        ciudad: str | None = None,
        radio_km: int = RADIO_DEFAULT_KM,
    ) -> UbicacionOut:
        """
        Ubicación elegida por el usuario.

        Con ciudad: devuelve coordenadas para usar latlong en Ticketmaster.
        Sin ciudad: devuelve solo el país (se filtra con countryCode).
        """
        codigo = codigo_pais.upper()
        pais = pycountry.countries.get(alpha_2=codigo)
        if not pais:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Código de país no válido.",
            )

        if not ciudad:
            return UbicacionOut(codigo_pais=codigo, pais=pais.name, origen="manual")

        buscada = ciudad.strip().lower()
        for c in _indexar_ciudades().get(codigo, []):
            if c["name"].lower() == buscada:
                ubicacion = UbicacionOut(
                    codigo_pais=codigo,
                    pais=pais.name,
                    ciudad=c["name"],
                    lat=c["latitude"],
                    lon=c["longitude"],
                    latlong=_formatear_latlong(c["latitude"], c["longitude"]),
                    origen="manual",
                )
                return _con_radio(ubicacion, radio_km)

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la ciudad '{ciudad}' en {pais.name}.",
        )