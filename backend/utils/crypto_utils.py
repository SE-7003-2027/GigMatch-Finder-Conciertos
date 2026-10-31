import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# Cargamos la llave maestra desde el .env
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    raise ValueError("Falta configurar ENCRYPTION_KEY en el archivo .env")

fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_token(token: str | None) -> str | None:
    """Cifra un token en texto plano para guardarlo en la base de datos."""
    if not token:
        return token
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str | None) -> str | None:
    """Descifra un token de la base de datos para usarlo en la API de Spotify."""
    if not encrypted_token:
        return encrypted_token
    return fernet.decrypt(encrypted_token.encode()).decode()