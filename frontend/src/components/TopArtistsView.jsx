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
            setArtistas(data.slice(0, 15));

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

            {/* Skeleton de carga (15 tarjetas simuladas) */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-8 max-w-[900px] w-full px-4 mb-16">
                    {Array.from({ length: 15 }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center animate-pulse">
                            <div className="w-[150px] h-[150px] bg-[#d9d9d9] p-2 border-2 border-[#111111] shadow-[4px_4px_0_#111111]">
                                <div className="w-full h-full bg-[#9ca3af] border border-[#222]" />
                            </div>
                            <div className="mt-4 h-3 w-[110px] bg-[#d9d9d9]/70 border border-[#111111]/40" />
                        </div>
                    ))}
                </div>
            )}

            {/* Estado vacío (cuenta sin historial en Spotify) */}
            {!loading && !errorInfo && artistas.length === 0 && (
                <div className="max-w-[520px] w-full mx-4 mb-16 bg-[#d9d9d9] border-2 border-[#111111] shadow-[4px_4px_0_#111111]">
                    <div className="bg-[#7b2b3a] px-4 py-2 border-b-2 border-[#111111] flex items-center justify-between">
                        <span className="text-[9px] text-white tracking-wider">
                            AVISO DEL SISTEMA
                        </span>
                    </div>
                    <div className="p-6 flex flex-col items-center text-center gap-5">
                        <p className="text-[9px] leading-[1.8] text-[#111111]">
                            NO ENCONTRAMOS ARTISTAS PRINCIPALES EN TU CUENTA DE SPOTIFY TODAVÍA.
                        </p>
                        <p className="text-[8px] leading-[1.8] text-[#4a1230] bg-[#e0cba5] p-3 border-2 border-[#111111]">
                            ESCUCHA UN POCO MÁS DE MÚSICA O CONTINÚA PARA EXPLORAR CONCIERTOS RECOMENDADOS.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <button
                                type="button"
                                onClick={fetchArtistas}
                                className="bg-[#e0cba5] hover:bg-[#ebd9b7] text-[#111111] text-[8px] px-4 py-3 border-2 border-[#111111] shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                            >
                                REINTENTAR
                            </button>
                            <button
                                type="button"
                                onClick={onContinue}
                                className="bg-[#8b1f4d] hover:bg-[#a1265b] text-white text-[8px] px-4 py-3 border-2 border-[#111111] shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                            >
                                CONTINUAR IGUAL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cuadrícula de artistas */}
            {!loading && !errorInfo && artistas.length > 0 && (
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
                            <span
                                title={artista.nombre}
                                className="mt-4 text-[8px] sm:text-[9px] leading-[1.6] uppercase text-white tracking-wider w-[150px] text-center line-clamp-2 break-words drop-shadow-[1px_1px_0_#111]"
                            >
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
                    className="relative bg-[#4b0032] hover:bg-[#5c003d] text-white text-[12px] tracking-[2px] text-center px-16 py-4 rounded-[16px] border-4 border-[#3f002c] shadow-[inset_0_0_0_3px_#ff74a5,inset_0_0_0_6px_#8c2559,0_6px_0_#200018,0_8px_18px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_0_0_3px_#ffa0c0,inset_0_0_0_6px_#b03272,0_0_22px_rgba(255,116,165,0.45),0_6px_0_#200018,0_10px_22px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[inset_0_0_0_3px_#ff74a5,inset_0_0_0_6px_#8c2559,0_2px_0_#200018] transition-all cursor-pointer select-none mb-12"
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