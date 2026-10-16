from fastapi import APIRouter, Query, Request

from core.schemas import UbicacionOut, PaisOut, CiudadOut
from services.geo_service import (
    RADIO_DEFAULT_KM,
    RADIO_MIN_KM,
    RADIO_MAX_KM,
    GeoService,
)

router = APIRouter(
    prefix="/location",
    tags=["Contexto y Geolocalización"]
)

# Extraemos la IP del cliente para detectar su ubicación geográfica
def obtener_ip_cliente(request: Request) -> str | None:
    """
    IP real del cliente. Detrás de un proxy/balanceador llega en
    X-Forwarded-For (primer valor); si no, se usa la conexión directa.
    """
    forwarded = request.headers.get("x-forwarded-for")
    # Si no hay proxy, tomamos la IP de la conexión directa. Puede ser None si no hay conexión.
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None

# Endpoint para obetener la IP y añadimos el radio de búsqueda (km) a la ubicación detectada
@router.get("/detect", response_model=UbicacionOut)
async def detectar_ubicacion(
    request: Request,
    radio_km: int = Query(RADIO_DEFAULT_KM, ge=RADIO_MIN_KM, le=RADIO_MAX_KM,
                          description="Radio de búsqueda de conciertos en km"),
) -> UbicacionOut:
    """
    Detecta país, ciudad y coordenadas del usuario a partir de su IP (IP-API).

    Devuelve también `latlong` con el formato "lat,long" listo para el
    parámetro latlong de Ticketmaster, y `codigo_pais` (ej. MX) para countryCode.
    """
    return await GeoService.detectar_por_ip(obtener_ip_cliente(request), radio_km)

# Endpoint para listar países y ciudades, y resolver ubicación manual
@router.get("/countries", response_model=list[PaisOut])
def listar_paises():
    """Lista de países (código ISO de 2 letras) para el selector de ubicación."""
    return GeoService.listar_paises()

# Endpoint para listar ciudades de un país, con coordenadas
@router.get("/countries/{codigo_pais}/cities", response_model=list[CiudadOut])
def listar_ciudades(codigo_pais: str, limite: int = Query(50, ge=1, le=200)):
    """Ciudades más pobladas de un país, con sus coordenadas."""
    return GeoService.listar_ciudades(codigo_pais, limite)

# Endpoint para seleccionar manualmente país y ciudad, y obtener coordenadas para Ticketmaster
@router.get("/resolve", response_model=UbicacionOut)
def resolver_ubicacion(
    pais: str = Query(..., min_length=2, max_length=2, description="Código ISO, ej. MX"),
    ciudad: str | None = Query(None, description="Nombre de la ciudad (opcional)"),
    radio_km: int = Query(RADIO_DEFAULT_KM, ge=RADIO_MIN_KM, le=RADIO_MAX_KM,
                          description="Radio de búsqueda en km (solo aplica con ciudad)"),
):
    """
    Ubicación elegida manualmente por el usuario (botón 'cambiar ubicación').
    Mismo formato de respuesta que /location/detect.
    """
    return GeoService.resolver_ubicacion_manual(pais, ciudad, radio_km)