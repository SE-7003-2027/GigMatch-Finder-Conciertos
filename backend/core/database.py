import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

#Carga las variables del archivo .env
load_dotenv()

#Obtiene la URL de conexion
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

#Crea el motor de conexion
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#Crea la fabrica de sesiones para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Clase base para los futuros modelos (ORM)
Base = declarative_base()