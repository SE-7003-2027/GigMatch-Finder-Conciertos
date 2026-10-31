export default function MainLayout({ usuario, onLogout, vistaActual, setVistaActual, children }) {
    return (
        <div className="relative min-h-screen w-full bg-[#6798a8] pb-10">

            {/* 1. Barra Superior Global */}
            <header className="w-full h-[100px] bg-[#e0cba5] px-10 flex items-center justify-between border-b-4 border-[#111111]/20 sticky top-0 z-50">
                <h1 className="text-[22px] font-normal tracking-wider text-[#8b1f4d] drop-shadow-[3px_3px_0_#f0b3c6]">
                    GIGMATCH
                </h1>

                <div className="flex items-center gap-4">
                    <span
                        className="text-[8px] text-[#4a1230] bg-white px-3 py-2 border-2 border-[#8b1f4d] shadow-[2px_2px_0_#111111]"
                        title={`ID Spotify: ${usuario.id_spotify}`}
                    >
                        👤 {usuario.nombre}
                    </span>
                    <button
                        type="button"
                        className="bg-[#9b2226] hover:bg-[#b52a2f] text-white border-2 border-[#111111] text-[7px] px-3 py-2 shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-transform"
                        onClick={onLogout}
                    >
                        CERRAR SESIÓN
                    </button>
                </div>
            </header>

            {/* 2. Navegación Secundaria (Pestañas retro) */}
            <div className="max-w-[950px] mx-auto mt-8 px-4 flex justify-between items-end border-b-4 border-[#111111]">
                <h2 className="text-[14px] sm:text-[18px] tracking-[2px] text-[#8b1f4d] mb-2 drop-shadow-[2px_2px_0px_#f0b3c6]">
                    {vistaActual === 'artistas' ? 'ARTISTAS PRINCIPALES' : 'PRÓXIMOS CONCIERTOS'}
                </h2>

                <nav className="flex gap-2 mb-[-4px]">
                    <button
                        onClick={() => setVistaActual('artistas')}
                        className={`text-[8px] px-4 py-3 border-4 border-b-0 border-[#111111] transition-colors ${vistaActual === 'artistas'
                            ? 'bg-[#d9d9d9] text-[#111111] z-10 relative'
                            : 'bg-[#4a1230] text-white hover:bg-[#5e173d]'
                            }`}
                    >
                        TUS ARTISTAS
                    </button>
                    <button
                        onClick={() => setVistaActual('recomendaciones')}
                        className={`text-[8px] px-4 py-3 border-4 border-b-0 border-[#111111] transition-colors ${vistaActual === 'recomendaciones'
                            ? 'bg-[#d9d9d9] text-[#111111] z-10 relative'
                            : 'bg-[#4a1230] text-white hover:bg-[#5e173d]'
                            }`}
                    >
                        RECOMENDACIONES
                    </button>
                </nav>
            </div>

            {/* 3. Contenedor Dinámico para las vistas */}
            <main className="max-w-[950px] mx-auto mt-6 px-4">
                {children}
            </main>

        </div>
    );
}