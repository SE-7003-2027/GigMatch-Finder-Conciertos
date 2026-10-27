/**
 * Componente Mock de Próximos Conciertos.
 * Totalmente migrado a clases de utilidad de Tailwind CSS.
 * Preservado como referencia y listo para ser utilizado cuando se integre Ticketmaster.
 */

const CONCIERTOS_MOCK = [
  {
    id: 1,
    nombre: 'FESTIVAL',
    fechas: '25 Y 26 DE SEPTIEMBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    desp: 'ml-10',
    logo: true,
  },
  {
    id: 2,
    nombre: 'YOUNG MIKO',
    fechas: '22 DE SEPTIEMBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    desp: 'ml-2',
  },
  {
    id: 3,
    nombre: 'MOTORAMA',
    fechas: '01 DE OCTUBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    desp: 'ml-10',
  },
];

export function Campo({ etiqueta, valor, icono, nombre = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[112px] shrink-0 text-[7px] leading-relaxed text-center text-[#111111]">
        {etiqueta}
      </span>
      <div
        className={`flex-1 min-w-0 bg-[#e0cba5] px-2.5 py-2 flex justify-between items-center gap-2 ${
          nombre ? 'text-[12px] min-h-[40px]' : 'text-[8px] min-h-[34px]'
        }`}
      >
        <span>{valor}</span>
        {icono === 'flecha' && (
          <span className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-[#7b2b3a] shrink-0" />
        )}
        {icono === 'corazon' && (
          <span className="text-[12px] shrink-0">❤️</span>
        )}
        {icono === 'mapa' && (
          <span className="text-[12px] shrink-0">📍</span>
        )}
      </div>
    </div>
  );
}

export function FichaConcierto({ concierto, onCerrar, onComprar }) {
  const { nombre, fechas, sede, desp, logo, foto } = concierto;

  return (
    <section className={`w-[590px] bg-[#d9d9d9] shadow-[6px_6px_0_#111111] ${desp}`}>
      {/* Barra superior de la ventana */}
      <div className="bg-[#7b2b3a] text-white px-2.5 py-2 text-[9px] flex justify-between items-center m-2">
        <span>CONCIERTO</span>
        <button
          type="button"
          className="bg-[#d9d9d9] hover:bg-white text-[#111111] border-2 border-[#111111] px-1.5 py-0.5 text-[8px] cursor-pointer"
          onClick={() => onCerrar?.(concierto)}
          aria-label="Cerrar ficha"
        >
          X
        </button>
      </div>

      {/* Contenido de la ventana */}
      <div className="flex gap-3.5 p-2 pb-3.5">
        <div className="flex flex-col gap-2.5 w-[110px] shrink-0">
          <div
            className={`w-[110px] h-[110px] bg-cover bg-center ${
              logo
                ? 'bg-black'
                : 'bg-gradient-to-br from-[#f2f2f2] to-[#6b6b6b]'
            }`}
            style={foto ? { backgroundImage: `url(${foto})` } : undefined}
          />
          <button
            type="button"
            className="bg-[#8b1f4d] hover:bg-[#a12459] text-white border-t-[3px] border-l-[3px] border-[#d98aa5] border-r-[3px] border-b-[3px] border-[#260711] py-2.5 px-1 w-full text-[7px] leading-relaxed cursor-pointer shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
            onClick={() => onComprar?.(concierto)}
          >
            COMPRAR BOLETOS
          </button>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3.5">
          <Campo etiqueta="ARTISTA /FESTIVAL:" valor={nombre} icono="flecha" nombre />
          <Campo etiqueta="FECHA(S)" valor={fechas} icono="corazon" />
          <Campo etiqueta="SEDE" valor={sede} icono="mapa" />
        </div>
      </div>
    </section>
  );
}

export default function ProximosConciertosMock({
  conciertos = CONCIERTOS_MOCK,
  onCerrar,
  onComprar,
}) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#6798a8]">
      {/* Encabezado */}
      <header className="relative z-10 bg-[#e0cba5] w-full h-[100px] px-10 flex items-center justify-between border-b-4 border-[#111111]/20">
        <h1 className="text-[22px] font-normal tracking-wide text-[#8b1f4d] drop-shadow-[3px_3px_0_#f0b3c6]">
          PROXIMOS CONCIERTOS
        </h1>
        <nav className="flex gap-2.5">
          <button
            type="button"
            className="text-[7px] px-2.5 py-2 text-white bg-[#4a1230] border-[3px] border-[#8b1f4d] shadow-[inset_0_0_0_2px_#260711,2px_2px_0_#111111] cursor-pointer"
          >
            TUS ARTISTAS
          </button>
          <button
            type="button"
            className="text-[7px] px-2.5 py-2 text-white bg-[#4a1230] border-[3px] border-[#d98aa5] shadow-[inset_0_0_0_2px_#260711,2px_2px_0_#111111] cursor-pointer"
          >
            RECOMENDACIONES
          </button>
        </nav>
      </header>

      {/* Lista de fichas de conciertos */}
      <div className="relative w-[950px] mx-auto py-5 pb-10">
        <main className="relative z-10 flex flex-col gap-5">
          {conciertos.map((c) => (
            <FichaConcierto
              key={c.id}
              concierto={c}
              onCerrar={onCerrar}
              onComprar={onComprar}
            />
          ))}
        </main>
      </div>

      {/* Vinilo decorativo */}
      <div className="absolute -right-[270px] top-[58%] -translate-y-1/2 w-[540px] h-[540px] z-[1]">
        <div className="relative w-full h-full rounded-full bg-[repeating-radial-gradient(circle,#090909_0,#090909_5px,#202020_7px,#050505_9px)] border-[5px] border-black shadow-[-7px_7px_0_#111111] flex justify-center items-center">
          <div className="w-[150px] h-[150px] rounded-full bg-[#c7203e] border-[5px] border-[#111111] shadow-[inset_0_0_0_7px_#8d152b] flex items-center justify-center">
            <div className="w-5 h-5 bg-[#6798a8] rounded-full border-4 border-[#111111] relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
