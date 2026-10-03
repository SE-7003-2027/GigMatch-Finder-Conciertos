import os
from dotenv import load_dotenv
import base64
from datetime import datetime, timedelta
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.models import Usuario, Token
from utils.crypto_utils import encrypt_token

load_dotenv()  # Carga las variables de entorno desde el archivo .env

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

class AuthService:
    
    @staticmethod
    def get_spotify_login_url() -> str:
        """Genera la URL para que el usuario inicie sesión en Spotify."""
        scopes = "user-read-private user-read-email user-top-read"
        url = (
            f"https://accounts.spotify.com/authorize?response_type=code"
            f"&client_id={CLIENT_ID}&scope={scopes}&redirect_uri={REDIRECT_URI}"
        )
        return url

    @staticmethod
    async def process_spotify_callback(code: str, db: AsyncSession):
        """Intercambia el código por tokens, obtiene el perfil y guarda en BD."""
        
        # 1. Pedir tokens a Spotify
        auth_string = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth_string}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI
        }

        async with httpx.AsyncClient() as client:
            token_res = await client.post("https://accounts.spotify.com/api/token", data=data, headers=headers)
            if token_res.status_code != 200:
                raise ValueError("Error al obtener el token de Spotify")
            
            token_data = token_res.json()
            
            # 2. Obtener el perfil del usuario con el Access Token temporal
            user_headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            user_res = await client.get("https://api.spotify.com/v1/me", headers=user_headers)
            if user_res.status_code != 200:
                raise ValueError("Error al obtener el perfil de Spotify")
                
            user_data = user_res.json()

        # 3. Extraer datos y encriptar tokens
        id_spotify = user_data["id"]
        nombre = user_data.get("display_name", "Usuario Desconocido")
        
        token_cifrado = encrypt_token(token_data["access_token"])
        refresh_cifrado = encrypt_token(token_data.get("refresh_token", ""))
        expira_en = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])

        # 4. Guardar en PostgreSQL de forma asíncrona (Upsert)
        # Verificamos si el usuario ya existe
        result = await db.execute(select(Usuario).where(Usuario.idspotify == id_spotify))
        usuario = result.scalars().first()

        if not usuario:
            # Crear nuevo usuario
            usuario = Usuario(idspotify=id_spotify, nombre=nombre)
            db.add(usuario)
        else:
            # Actualizar nombre si cambió
            usuario.nombre = nombre

        # Verificamos si ya tiene un token y lo actualizamos, o creamos uno nuevo
        result_token = await db.execute(select(Token).where(Token.idspotify == id_spotify))
        token_db = result_token.scalars().first()

        if not token_db:
            token_db = Token(
                idspotify=id_spotify,
                accesstoken=token_cifrado,
                refreshtoken=refresh_cifrado,
                expiresat=expira_en
            )
            db.add(token_db)
        else:
            token_db.accesstoken = token_cifrado
            token_db.refreshtoken = refresh_cifrado
            token_db.expiresat = expira_en

        # Confirmar los cambios en la base de datos
        await db.commit()
        
        return {"message": "Autenticación exitosa", "usuario": nombre}