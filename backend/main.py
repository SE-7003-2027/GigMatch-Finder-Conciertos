import os
from dotenv import load_dotenv
load_dotenv()


from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import SessionLocal
from api import auth

app = FastAPI(title="GigMatch API", version="1.0.0")

app.include_router(auth.router, prefix="/api")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # El puerto de frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia asíncrona para inyectar la sesión de BD
async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

@app.get("/")
async def raiz():
    return {"mensaje": "¡Backend de GigMatch funcionando correctamente!"}

# Endpoint asíncrono para probar la db
@app.get("/db")
async def probar_conexion(db: AsyncSession = Depends(get_db)):
    try:
        # Ejecutando un query directo con await para verificar la conexion
        resultado = await db.execute(text("SELECT 1"))
        valor = resultado.scalar()
        return {
            "status": "online",
            "database": "conectada",
            "result": valor
        }
    except Exception as e:
        return {
            "status": "offline",
            "error": str(e)
        }