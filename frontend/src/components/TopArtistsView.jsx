import { useState, useEffect, useCallback } from 'react';
import { getTopArtists } from "../services/spotifyService";
import ErrorModal from "./ErrorModal";

export default function TopArtistsView({ idSpotify, onContinue }) {
    const [artistas, setArtistas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorInfo, setErrorInfo] = useState(null);

    const fetchArtistas = useCallback(async () => {
        try {
            setLoading(true);
            setErrorInfo(null);

            const data = await getTopArtists(idSpotify);
            setArtistas(data.slice(0, 20));

        } catch (err) {
            // Estructuramos el error para que tu ErrorModal lo procese correctamente
            setErrorInfo({
                title: 'ERROR AL CARGAR ARTISTAS',
                desc: err.message || 'No se pudo establecer conexión con la base de datos o Spotify.',
                tip: 'Verifica tu conexión a internet o intenta reiniciar el servidor de FastAPI.'
            });
        } finally {
            setLoading(false);
        }
    }, [idSpotify]);

    useEffect(() => {
        if (idSpotify) {
            fetchArtistas();
        }
    }, [idSpotify, fetchArtistas]);

    return (
        <div className="flex flex-col items-center justify-center w-full mt-10">
            <h2 className="text-[16px] sm:text-[22px] tracking-[4px] text-white mb-10 text-center drop-shadow-[2px_2px_0px_#9b2226,3px_3px_0px_#4a1230]">
                ARTISTAS PRINCIPALES
            </h2>

            {loading && (
                < div className="my-20 text-[10px] text-[#e0cba5] animate-pulse drop-shadow-[2px_2px_0_#111]">
                    ACCEDIENDO A SPOTIFY...
                </div>
            )}

            {!loading && !errorInfo && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-8 max-w-[900px] w-full px-4 mb-16">
                    {artistas.map((artista, index) => (
                        <div key={artista.id_spotify || index} className="flex flex-col items-center group">
                            <div className="w-[150px] h-[150px] sm:w-[150px] sm:h-[150px] bg-[#d9d9d9] p-2 border-2 border-[#111111] shadow-[4px_4px_0_#111111] transition-transform group-hover:-translate-y-1">
                                <div className="w-full h-full bg-[#111] overflow-hidden border border-[#222]">
                                    <img
                                        src={artista.imagen_url || 'https://via.placeholder.com/150'}
                                        alt={artista.nombre}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        draggable="false"
                                    />
                                </div>
                            </div>
                            <span className="mt-4 text-[8px] sm:text-[9px] uppercase text-white tracking-wider max-w-[120px] text-center truncate drop-shadow-[1px_1px_0_#111]">
                                {artista.nombre}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {!loading && !errorInfo && artistas.length > 0 && (
                <button
                    type="button"
                    onClick={onContinue}
                    className="bg-[#7b2b3a] hover:bg-[#9b2226] text-white text-[10px] tracking-widest px-10 py-4 border-4 border-[#111111] shadow-[inset_0_0_0_2px_#d98aa5,4px_4px_0_#111111] active:translate-x-1 active:translate-y-1 active:shadow-[inset_0_0_0_2px_#d98aa5,0_0_0_#111111] transition-all cursor-pointer select-none"
                >
                    CONTINUAR
                </button>
            )}

            <ErrorModal
                errorInfo={errorInfo}
                onClose={() => setErrorInfo(null)}
                onRetry={fetchArtistas}
            />
        </div>
    );
}