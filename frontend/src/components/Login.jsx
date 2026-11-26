import { useState } from 'react';
import cdDiscImage from '../assets/cd_inicio.png';
import ErrorModal from './ErrorModal';
import {
    redirectToSpotifyLogin,
    parseAuthUrlParams,
    cleanUrlParams,
} from '../services/authService';

/**
- Pantalla de Inicio / Login con Spotify.
- 100% utilidades de Tailwind CSS con diseño retro (1440x958).
 */
export default function Login() {
    const [errorInfo, setErrorInfo] = useState(() => parseAuthUrlParams().error);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleSpotifyLogin = () => {
        setIsConnecting(true);
        redirectToSpotifyLogin();
    };

    const handleCloseError = () => {
        setErrorInfo(null);
        cleanUrlParams();
    };

    return (
        <div className="relative min-h-screen w-full bg-[#7aa2b3] flex items-center justify-center p-5 overflow-hidden">
            {/* Contenedor principal (stage de 1440px máx) */}
            <div className="relative w-full max-w-[1440px] min-h-[720px] flex items-center justify-between">

                {/* Lado izquierdo: Estuche y Disco CD holográfico */}
                <div className="relative w-[780px] h-[760px] flex items-center">
                    {/* Disco con rotación suave continua */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[750px] h-[750px] z-20 transition-transform duration-300 hover:translate-x-4">
                        <img
                            src={cdDiscImage}
                            alt="Disco Compacto Holográfico de GigMatch"
                            className="w-full h-full object-contain drop-shadow-[6px_10px_18px_rgba(0,0,0,0.35)] animate-[spin_30s_linear_infinite] select-none block"
                            draggable="false"
                        />
                    </div>
                </div>

                {/* Lado derecho: Título, frase y botón de Spotify */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 z-30 -mt-20">
                    <h1 className="text-[48px] sm:text-[56px] font-normal tracking-[5px] text-white text-center drop-shadow-[4px_4px_0px_#9b2226,6px_6px_0px_#4a1230] select-none mb-12">
                        GIGMATCH
                    </h1>

                    <p className="text-[12px] sm:text-[13px] leading-[2.2] text-[#f5e6c8] tracking-wide text-center drop-shadow-[2px_2px_0_#111111] mb-12 select-none">
                        "EN UN MUNDO DONDE TODO SE DIGITALIZA,
                        <br />
                        ¡NO OLVIDES LA MAGIA DE LA MÚSICA EN VIVO!"
                    </p>

                    <button
                        type="button"
                        className="relative bg-[#4b0032] hover:bg-[#5c003d] text-white text-[14px] leading-[1.8] tracking-[1.5px] text-center px-11 py-6 rounded-[18px] border-4 border-[#3f002c] shadow-[inset_0_0_0_3px_#ff74a5,inset_0_0_0_6px_#8c2559,0_6px_0_#200018,0_8px_18px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_0_0_3px_#ffa0c0,inset_0_0_0_6px_#b03272,0_0_22px_rgba(255,116,165,0.45),0_6px_0_#200018,0_10px_22px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[inset_0_0_0_3px_#ff74a5,inset_0_0_0_6px_#8c2559,0_2px_0_#200018] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-80 disabled:cursor-wait"
                        onClick={handleSpotifyLogin}
                        disabled={isConnecting}
                        aria-label="Iniciar sesión con Spotify"
                    >
                        {isConnecting ? (
                            <>
                                <span>CONECTANDO...</span>
                                <span className="text-[10px] opacity-80">ESPERA UN MOMENTO</span>
                            </>
                        ) : (
                            <>
                                <span>INICIAR SESIÓN</span>
                                <span>CON SPOTIFY</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Modal retro para mensajes de error */}
            <ErrorModal
                errorInfo={errorInfo}
                onClose={handleCloseError}
                onRetry={handleSpotifyLogin}
            />
        </div>
    );
}