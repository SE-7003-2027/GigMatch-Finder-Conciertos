from pydantic import BaseModel, ConfigDict
from datetime import datetime

# ==========================================
# ESQUEMAS DE TOKEN
# ==========================================
class TokenBase(BaseModel):
    accessToken: str
    refreshToken: str
    expiresAt: datetime

class TokenCreate(TokenBase):
    idSpotify: str

class TokenOut(TokenBase):
    idSpotify: str
    
    # Esto permite que Pydantic lea directamente el modelo de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# ESQUEMAS DE USUARIO
# ==========================================
class UsuarioBase(BaseModel):
    idSpotify: str
    nombre: str

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioOut(UsuarioBase):
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# ESQUEMAS DEL TOP ARTISTAS
# ==========================================
class ArtistaOut(BaseModel):
    """
    Filtra la respuesta de la API de Spotify para enviar al frontend de 
    GigMatch únicamente los datos necesarios que serviran para crear la GUI,
    optimizando así el consumo de red.
    """
    id_spotify: str     # Id del artista/banda respecto a la bd de Spotify
    nombre: str         # Nombre artistico (pseudonimo) registrado
    generos: list[str]  # Generos asociados a su musica
    imagen_url: str     # URL de la fotografia asociada