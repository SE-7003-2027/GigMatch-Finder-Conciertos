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
async def spotify_callback(code: str = None, error: str = None, db: AsyncSession = Depends(get_db)):
    """Recibe el código de Spotify, lo procesa y redirige al frontend."""
    if error:
        return RedirectResponse(url=f"http://localhost:5173/?error={error}")
    
    if not code:
        return RedirectResponse(url="http://localhost:5173/?error=missing_code")

    try:
        user_info = await AuthService.process_spotify_callback(code, db)
        id_spotify = user_info.get("id_spotify", "") if isinstance(user_info, dict) else ""
        nombre = user_info.get("usuario", "") if isinstance(user_info, dict) else ""
        return RedirectResponse(url=f"http://localhost:5173/?login=success&id_spotify={id_spotify}&nombre={nombre}")
    
    except Exception as e:
        print("🚨 ERROR FATAL AL GUARDAR:", str(e))
        import traceback
        traceback.print_exc()
        return RedirectResponse(url="http://localhost:5173/?error=auth_failed")