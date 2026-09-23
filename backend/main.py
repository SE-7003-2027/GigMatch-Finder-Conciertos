from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import SessionLocal

app = FastAPI(title="GigMatch API", version="1.0.0")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # El puerto de frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia para inyectar la sesion de BD en las peticiones que lo necesiten
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def raiz():
    return {"mensaje": "¡Backend de GigMatch funcionando correctamente!"}

#Endpoint para probar la db
@app.get("/db")
def probar_conexion(db: Session = Depends(get_db)):
    try:
        #Ejecutando un query directo para verificar la conexion
        resultado = db.execute(text("SELECT 1")).scalar()
        return {
            "status": "online",
            "database": "conectada",
            "result": resultado
        }
    except Exception as e:
        return {
            "status": "offline",
            "error": str(e)
        }