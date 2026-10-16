from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
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

# ==========================================
# ESQUEMAS DE UBICACIÓN
# ==========================================
class UbicacionOut(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    codigo_pais: str          # ISO 3166-1 alpha-2 (Ej. "MX")
    pais: str | None = None
    ciudad: str | None = None
    lat: float | None = None
    lon: float | None = None
    latlong: str | None = None 
    radio_km: int | None = None
    origen: str

class PaisOut(BaseModel):
    codigo: str
    nombre: str

class CiudadOut(BaseModel):
    nombre: str
    lat: float
    lon: float