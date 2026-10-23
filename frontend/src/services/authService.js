const STORAGE_KEY = 'gigmatch_user';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const ERROR_CATALOG = {
    access_denied: {
        title: 'ACCESO CANCELADO',
        desc: 'Cancelaste la autorización en Spotify. GigMatch necesita permisos para acceder a tus artistas principales y recomendarte conciertos en vivo.',
        tip: 'Presiona "REINTENTAR" para volver a conectar con Spotify y aceptar los permisos.',
    },
    auth_failed: {
        title: 'ERROR DE AUTENTICACIÓN',
        desc: 'No se pudo intercambiar el token de acceso con Spotify o hubo un problema al guardar la sesión en el servidor.',
        tip: 'Asegúrate de que el servidor backend (FastAPI) y la base de datos estén activos.',
    },
    missing_code: {
        title: 'CÓDIGO DE AUTORIZACIÓN AUSENTE',
        desc: 'La respuesta de Spotify no incluyó el código de autorización requerido.',
        tip: 'Vuelve a iniciar sesión desde el botón principal.',
    },
    server_offline: {
        title: 'SERVIDOR INACCESIBLE',
        desc: 'No se logró establecer conexión con el servidor de GigMatch en el puerto 8000.',
        tip: 'Verifica que uvicorn esté corriendo en la terminal.',
    },
};

/**
 * Obtiene el usuario guardado en localStorage.
 */
export function getStoredUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error('Error al leer sesión de usuario:', e);
        return null;
    }
}

/**
 * Guarda los datos de sesión en localStorage.
 */
export function saveStoredUser(userData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
        console.error('Error al guardar sesión:', e);
    }
}

/**
 * Elimina la sesión del usuario.
 */
export function clearStoredUser() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Redirige al flujo de login de Spotify en el backend.
 */
export function redirectToSpotifyLogin() {
    window.location.href = `${BACKEND_URL}/api/auth/login`;
}

/**
 * Analiza los parámetros de la URL actual (?login=success, ?error=..., ?id_spotify=..., ?nombre=...).
 * Limpia la URL sin recargar para evitar reejecuciones al refrescar la página.
 */
export function parseAuthUrlParams() {
    if (typeof window === 'undefined') return { error: null, user: null };

    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const loginParam = params.get('login');
    const idSpotify = params.get('id_spotify');
    const nombre = params.get('nombre');

    // Si hubo error
    if (errorParam) {
        const errorDetails = ERROR_CATALOG[errorParam] || {
            title: 'ERROR EN EL SISTEMA',
            desc: `Ocurrió un error inesperado al autenticar: "${errorParam}".`,
            tip: 'Intenta iniciar sesión de nuevo.',
        };
        return { error: errorDetails, user: null };
    }

    // Si hubo login exitoso
    if (loginParam === 'success' && idSpotify) {
        const user = {
            id_spotify: idSpotify,
            nombre: nombre || 'Usuario de Spotify',
        };
        saveStoredUser(user);
        // Limpiar query params de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return { error: null, user };
    }

    return { error: null, user: null };
}

/**
 * Limpia los parámetros de error de la barra de direcciones.
 */
export function cleanUrlParams() {
    if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}
