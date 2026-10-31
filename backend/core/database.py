import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

# Obtiene la URL de conexion (Asegúrate de que el .env empiece con postgresql+asyncpg://)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Crea el motor asíncrono
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# Crea la fabrica de sesiones asíncronas para interactuar con la BD
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False, 
    autoflush=False
)

# Clase base para los futuros modelos (ORM)
Base = declarative_base()    

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()