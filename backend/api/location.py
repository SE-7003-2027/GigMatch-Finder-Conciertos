from fastapi import APIRouter, Query, Request

from core.schemas import CiudadOut, PaisOut, UbicacionOut
from services.geo_service import GeoService

router = APIRouter(
    prefix="/location",
    tags=["Contexto y Geolocalización"]
)


def obtener_ip_cliente(request: Request) -> str | None:
    """
    IP real del cliente. Detrás de un proxy/balanceador llega en
    X-Forwarded-For (primer valor); si no, se usa la conexión directa.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.get("/detect", response_model=UbicacionOut)
async def detectar_ubicacion(request: Request) -> UbicacionOut:
    """
    Detecta país, ciudad y coordenadas del usuario a partir de su IP (IP-API).

    Devuelve también `latlong` con el formato "lat,long" listo para el
    parámetro latlong de Ticketmaster, y `codigoPais` (ej. MX) para countryCode.
    """
    return await GeoService.detectar_por_ip(obtener_ip_cliente(request))


@router.get("/countries", response_model=list[PaisOut])
def listar_paises() -> list[PaisOut]:
    """Lista de países (código ISO de 2 letras) para el selector de ubicación."""
    return GeoService.listar_paises()


@router.get("/countries/{codigo_pais}/cities", response_model=list[CiudadOut])
def listar_ciudades(
    codigo_pais: str, limite: int = Query(50, ge=1, le=200)
) -> list[CiudadOut]:
    """Ciudades más pobladas de un país, con sus coordenadas."""
    return GeoService.listar_ciudades(codigo_pais, limite)


@router.get("/resolve", response_model=UbicacionOut)
def resolver_ubicacion(
    pais: str = Query(..., min_length=2, max_length=2, description="Código ISO, ej. MX"),
    ciudad: str | None = Query(None, description="Nombre de la ciudad"),
) -> UbicacionOut:
    """
    Ubicación elegida manualmente por el usuario (botón 'cambiar ubicación').
    Mismo formato de respuesta que /location/detect.
    """
    return GeoService.resolver_ubicacion_manual(pais, ciudad)