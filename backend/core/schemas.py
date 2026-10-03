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