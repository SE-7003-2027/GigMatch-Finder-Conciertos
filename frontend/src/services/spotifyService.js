const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
/**
 * Obtiene los artistas principales de un usuario desde Spotify.
 * @param {string} idSpotify ID unico asignado al usuario por Spotify
 * @returns {Promise<Array>} Una promesa que se resuelve en un array con los artistas principales del usuario.
 */
export async function getTopArtists(idSpotify) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/spotify/${idSpotify}/top-artists`);

        if (!response.ok) {
            // Intentar extraer el detalle del error desde FastAPI
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Fallo de conexión al cargar los artistas desde Spotify.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getTopArtists:', error);
        // Lanzar el error para que la vista lo capture y lo muestre
        throw error;
    }
}