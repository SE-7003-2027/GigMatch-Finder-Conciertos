from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    idspotify = Column(String(100), primary_key=True, nullable=False)
    nombre = Column(String(100), nullable=False)

    # Relación 1 a 1 con Token
    # uselist=False asegura que SQLAlchemy lo trate como un objeto único y no como una lista
    # cascade="all, delete-orphan" elimina el token automáticamente si se borra el usuario
    token = relationship("Token", back_populates="usuario", uselist=False, cascade="all, delete-orphan")

class Token(Base):
    __tablename__ = "token"

    # PK y FK al mismo tiempo, conectando con usuario.idSpotify
    idspotify = Column(
        String(100), 
        ForeignKey("usuario.idspotify", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True, 
        nullable=False
    )
    accesstoken = Column(Text, nullable=False)
    refreshtoken = Column(Text, nullable=False)
    expiresat = Column(DateTime, nullable=False)

    # Relación inversa hacia Usuario
    usuario = relationship("Usuario", back_populates="token")