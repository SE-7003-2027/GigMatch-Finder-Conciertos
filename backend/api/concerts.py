from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.schemas import ConciertoOut

from services.concert_service import ConcertService
from utils.ip_util import obtener_ip_cliente

router = APIRouter(
    prefix="/concerts",
    tags=["Concerts"]
)

@router.get("/{id_spotify}/country", response_model=list[ConciertoOut])
async def obtener_eventos_por_pais(id_spotify: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Obtiene conciertos en todo el pais de los artistas del usuario"""

    ip = obtener_ip_cliente(request)

    return await ConcertService.obtener_eventos_por_pais(id_spotify, ip, db)


@router.get("/{id_spotify}/nearby", response_model=list[ConciertoOut])
async def obtener_eventos_cercanos(id_spotify: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Obtiene conciertos de los artistas del usuario en su zona cercana."""

    ip = obtener_ip_cliente(request)

    return await ConcertService.obtener_eventos_cercanos(id_spotify, ip, db)