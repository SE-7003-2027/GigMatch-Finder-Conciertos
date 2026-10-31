from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from services.spotify_service import SpotifyService
from core.schemas import ArtistaOut 

router = APIRouter(
    prefix="/spotify",
    tags=["Spotify Top Artist"]
)

@router.get("/{id_spotify}/top-artists", response_model=list[ArtistaOut])
async def get_top_artists(id_spotify: str, db: AsyncSession = Depends(get_db)):
    """
    Consulta los artistas más escuchados de un usuario.
    
    Realiza la petición al endpoint top-artists de Spotify, extrae los
    datos relevantes de la salida mediante el esquema ArtistaOut y 
    los devuelve para usar en el frontend.

    Requiere:
    - id_spotify: id único asignado al usuario por Spotify
    - db: Inyección automática de la sesión de base de datos

    Devuelve:
    - Una lista de objetos que cumplen con la estructura de ArtistaOut
    """
    artistas = await SpotifyService.get_user_top_artists(id_spotify, db)
    return artistas