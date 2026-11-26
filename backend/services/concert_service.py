from sqlalchemy.ext.asyncio import AsyncSession

from services.spotify_service import SpotifyService
from services.geo_service import GeoService
from services.ticketmaster_service import TicketmasterService


class ConcertService:
    """Coordina los servicios de Spotify, geolocalización y Ticketmaster
    para obtener los conciertos del usuario dependiendo su top artistas y ubicacion."""

    @staticmethod
    async def _obtener_contexto(
        id_spotify: str,
        ip: str,
        db: AsyncSession
    ):
        """Este metodo es para no duplicar codigo al obtener los top artistas
            y la ubicacion del usuario"""

        artistas = await SpotifyService.get_user_top_artists(id_spotify, db)

        if not artistas:
            return [], None

        ubicacion = await GeoService.detectar_por_ip(ip)

        return artistas, ubicacion

    @staticmethod
    async def obtener_eventos_por_pais(
        id_spotify: str,
        ip: str,
        db: AsyncSession
    ):
        """Busca conciertos de los artistas en todo el pais"""

        artistas, ubicacion = await ConcertService._obtener_contexto(id_spotify, ip, db)

        if not artistas:
            return []

        return await TicketmasterService.obtener_eventos_por_pais(artistas, ubicacion)

    @staticmethod
    async def obtener_eventos_cercanos(
        id_spotify: str,
        ip: str,
        db: AsyncSession
    ):
        """Busca conciertos de los artistas en la zona cercana."""

        artistas, ubicacion = await ConcertService._obtener_contexto(id_spotify, ip, db)

        if not artistas:
            return []

        return await TicketmasterService.obtener_eventos_cercanos(artistas, ubicacion)