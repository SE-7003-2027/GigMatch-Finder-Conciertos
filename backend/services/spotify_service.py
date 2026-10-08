import os
import base64
import httpx
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.models import Token
from utils.crypto_utils import decrypt_token, encrypt_token

class SpotifyService:
    """
    Servicio encargado de gestionar las interacciones directas con la API
    de Spotify.
    Actualmente se implementa la extraccion y procesamiento de datos
    respecto al perfil de usuario para:
    * Acceder a su top de artistas.
    """

    @staticmethod
    # El guion medio al inicio hace que el metodo sea privado (realmente no es necesario para nuestra API,creo)
    async def _verificar_y_renovar_token(token_db: Token, db: AsyncSession) -> str:
        """
        Verifica si el token de acceso ha expirado. 
        Si es así, solicita uno nuevo a Spotify  y actualiza la base 
        de datos automáticamente.

        Requiere:
        - token_db: Cifrado del token de acceso del usuario
        - db: Sesión asíncrona de la base de datos

        Devuelve:
        - Token listo para usarse.
        """
        # Si el token aún es válido, simplemente lo descifra y lo devuelve
        if token_db.expiresat > datetime.now():
            return decrypt_token(token_db.accesstoken)

        # Si expiró, requerimos de las credenciales
        CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
        CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
        refresh_token_actual = decrypt_token(token_db.refreshtoken)

        # Credenciales codificadas en base64 para enviar a spotify
        credenciales = f"{CLIENT_ID}:{CLIENT_SECRET}"
        credenciales_b64 = base64.b64encode(credenciales.encode()).decode()

        headers = {
            "Authorization": f"Basic {credenciales_b64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token_actual
        }

        async with httpx.AsyncClient() as client:
            res = await client.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
            
            if res.status_code != 200:
                raise HTTPException(
                    status_code=401, 
                    detail="No se pudo renovar la sesión con Spotify. El usuario debe volver a iniciar sesión."
                )
                
            nuevos_datos = res.json()

        # Encriptamos el nuevo token de acceso
        nuevo_access_token_visible = nuevos_datos["access_token"]
        token_db.accesstoken = encrypt_token(nuevo_access_token_visible)
        
        # Calculamos la nueva fecha de expiración
        token_db.expiresat = datetime.now() + timedelta(seconds=nuevos_datos["expires_in"])

        # Actualizacion de refresh token en caso de que Spotify lo requiera
        if "refresh_token" in nuevos_datos:
            token_db.refreshtoken = encrypt_token(nuevos_datos["refresh_token"])

        # Guardamos los cambios en la base de datos
        await db.commit()

        return nuevo_access_token_visible
    
    @staticmethod
    async def get_user_top_artists(id_spotify: str, db: AsyncSession) -> list[dict]:
        """
        Obtiene los artistas más escuchados del usuario desde Spotify.
        
        Busca el registro del usuario en la base de datos, realiza 
        la petición autenticada a la API de Spotify y le da formato
        a la respuesta obtenida.

        Requiere:
        - id_spotify: ID único asignado al usuario por Spotify
        - db: Sesión asíncrona de la base de datos.

        Devuelve:
        - Lista de diccionarios con los datos necesarios de cada artista.
        """
        # Buscar el token del usuario en la base de datos (el registro se tuvo que hacer en la autenticacion)
        result = await db.execute(select(Token).where(Token.idspotify == id_spotify))
        token_db = result.scalars().first()
        
        if not token_db:
            raise HTTPException(status_code=404, detail="El usuario no tiene un token establecido en GigMatch.")
            
        # Verificar expiracion  y realizar la peticion a spotify
        access_token_visible = await SpotifyService._verificar_y_renovar_token(token_db, db)
        headers = {"Authorization": f"Bearer {access_token_visible}"}
        
        async with httpx.AsyncClient() as client:
            res = await client.get("https://api.spotify.com/v1/me/top/artists", headers=headers)
            
            # Si Spotify rechaza la petición, extraemos su mensaje exacto
            if res.status_code != 200:
                error_data = res.json()
                mensaje_spotify = error_data.get("error", {}).get("message", "Error ocurrido en Spotify")
                raise HTTPException(
                    status_code=res.status_code, 
                    detail=f"Mensaje de Spotify: {mensaje_spotify}"
                )
                
            data = res.json()

        # Formato de top artistas para el frontend
        top_artist_para_frontend = []
        for item in data.get("items", []):
            imagen = item["images"][0]["url"] if item.get("images") else ""
            
            top_artist_para_frontend.append({
                "id_spotify": item["id"],
                "nombre": item["name"],
                "generos": item.get("genres", []),
                "imagen_url": imagen
            })
            
        return top_artist_para_frontend