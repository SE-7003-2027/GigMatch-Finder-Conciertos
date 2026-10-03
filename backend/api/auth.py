from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

# Ajusta estas importaciones según la estructura exacta de tus carpetas
from core.database import get_db
from services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)

@router.get("/login")
def login_spotify():
    """Redirige al usuario a la página de autorización de Spotify."""
    url = AuthService.get_spotify_login_url()
    return RedirectResponse(url)

@router.get("/callback")
async def spotify_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Recibe el código de Spotify, lo procesa y redirige al frontend."""
    try:
        await AuthService.process_spotify_callback(code, db)
        return RedirectResponse(url="http://localhost:5173/dashboard?login=success")
    
    except Exception as e:
        print("🚨 ERROR FATAL AL GUARDAR:", str(e))
        import traceback
        traceback.print_exc()
        return RedirectResponse(url=f"http://localhost:5173/?error=auth_failed")