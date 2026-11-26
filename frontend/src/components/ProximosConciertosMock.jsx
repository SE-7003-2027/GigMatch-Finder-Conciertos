import { useState, useEffect, useCallback } from 'react';
import viniloImg from '../assets/vinilo.png';
import ErrorModal from './ErrorModal';

/**
- Componente Mock de Próximos Conciertos.
- Totalmente migrado a clases de utilidad de Tailwind CSS.
- Preservado como referencia y listo para ser utilizado cuando se integre Ticketmaster.
 */

const CONCIERTOS_MOCK = [
  {
    id: 1,
    nombre: 'FESTIVAL',
    fechas: '25 Y 26 DE SEPTIEMBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    url: 'https://www.ticketmaster.com.mx/',
    desp: 'ml-10',
    logo: true,
  },
  {
    id: 2,
    nombre: 'YOUNG MIKO',
    fechas: '22 DE SEPTIEMBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    url: 'https://www.ticketmaster.com.mx/search?q=Young+Miko',
    desp: 'ml-2',
  },
  {
    id: 3,
    nombre: 'MOTORAMA',
    fechas: '01 DE OCTUBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    url: 'https://www.ticketmaster.com.mx/search?q=Motorama',
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
        className={`flex-1 min-w-0 bg-[#e0cba5] px-2.5 py-2 flex justify-between items-center gap-2 text-[#111111] ${
          nombre ? 'text-[12px] min-h-[40px]' : 'text-[8px] min-h-[34px]'
        }`}
      >
        <span>{valor}</span>
        {icono === 'flecha' && (
          <span className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-[#7b2b3a] shrink-0" />
        )}
        {icono === 'corazon' && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 11 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            className="shrink-0"
            style={{ imageRendering: 'pixelated' }}
          >
            <path
              d="M2 0h2v1h1v1h1V1h1V0h2v1h1v1h1v3h-1v1H9v1H8v1H7v1H6v1H5V9H4V8H3V7H2V6H1V5H0V2h1V1h1V0z"
              fill="#111111"
            />
          </svg>
        )}
        {icono === 'mapa' && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 11 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            className="shrink-0"
            style={{ imageRendering: 'pixelated' }}
          >
            <path
              d="M3 0h5v1h1v1h1v3H9v1H8v1H7v1H6v1H5V8H4V7H3V6H2V5H1V2h1V1h1V0zm1 2v2h3V2H4z"
              fill="#111111"
            />
            <path d="M1 10h9v1H1v-1zm-1 1h11v1H0v-1z" fill="#111111" />
          </svg>
        )}
      </div>
    </div>
  );
}

export function FichaConcierto({ concierto, onCerrar, onComprar }) {
  const { nombre, fechas, sede, desp, logo, foto, url } = concierto;
  const tieneUrl = Boolean(url);

  return (
    <section className={`w-[590px] bg-[#d9d9d9] border-2 border-[#111111] shadow-[6px_6px_0_#111111] ${desp}`}>
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
            className={`w-[110px] h-[110px] bg-cover bg-center border border-[#111111] ${
              logo
                ? 'bg-black'
                : 'bg-gradient-to-br from-[#f2f2f2] to-[#6b6b6b]'
            }`}
            style={foto ? { backgroundImage: `url(${foto})` } : undefined}
          />
          <button
            type="button"
            disabled={!tieneUrl}
            title={tieneUrl ? `Comprar boletos para ${nombre} en Ticketmaster` : 'Enlace de boletos no disponible'}
            className={`border-t-[3px] border-l-[3px] border-r-[3px] border-b-[3px] py-2.5 px-1 w-full text-[7px] leading-relaxed shadow-[2px_2px_0_#111111] transition-transform ${
              tieneUrl
                ? 'bg-[#8b1f4d] hover:bg-[#a12459] text-white border-t-[#d98aa5] border-l-[#d98aa5] border-r-[#260711] border-b-[#260711] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                : 'bg-[#7a7a7a] text-[#d9d9d9] border-[#444444] cursor-not-allowed opacity-70'
            }`}
            onClick={() => onComprar?.(concierto)}
          >
            {tieneUrl ? 'COMPRAR BOLETOS' : 'NO DISPONIBLE'}
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

function FichaConciertoSkeleton({ desp }) {
  return (
    <div className={`w-[590px] bg-[#d9d9d9] border-2 border-[#111111] shadow-[6px_6px_0_#111111] animate-pulse ${desp}`}>
      <div className="bg-[#7b2b3a]/70 h-[32px] m-2" />
      <div className="flex gap-3.5 p-2 pb-3.5">
        <div className="flex flex-col gap-2.5 w-[110px] shrink-0">
          <div className="w-[110px] h-[110px] bg-[#9ca3af] border border-[#111111]/40" />
          <div className="h-[34px] w-full bg-[#8b1f4d]/50 border border-[#111111]/40" />
        </div>
        <div className="flex-1 flex flex-col gap-3.5 justify-center">
          <div className="h-[40px] bg-[#e0cba5]/70" />
          <div className="h-[34px] bg-[#e0cba5]/70" />
          <div className="h-[34px] bg-[#e0cba5]/70" />
        </div>
      </div>
    </div>
  );
}

export default function ProximosConciertosMock({
  conciertos = CONCIERTOS_MOCK,
  onComprar,
}) {
  const [listaOriginal, setListaOriginal] = useState([]);
  const [listaConciertos, setListaConciertos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  const fetchConciertos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorInfo(null);

      // TODO: Reemplazar con la llamada real al backend de Ticketmaster cuando se apruebe el PR
      // Para probar ErrorModal, descomenta la siguiente línea:
      // throw new Error('No se pudo conectar con la API de Ticketmaster.');

      // Para probar el estado vacío real, cambia `conciertos` por `[]`
      setListaOriginal(conciertos);
      setListaConciertos(conciertos);
    } catch (err) {
      setErrorInfo({
        title: 'ERROR AL CARGAR CONCIERTOS',
        desc: err.message || 'No se pudo obtener la lista de próximos conciertos desde Ticketmaster.',
        tip: 'Verifica tu conexión a internet o intenta reiniciar el servidor de FastAPI.',
      });
    } finally {
      // Para ver el skeleton fijo, comenta la siguiente línea temporalmente:
      setLoading(false);
    }
  }, [conciertos]);

  useEffect(() => {
    fetchConciertos();
  }, [fetchConciertos]);

  const handleCerrar = (conciertoCerrar) => {
    setListaConciertos((prev) => prev.filter((c) => c.id !== conciertoCerrar.id));
  };

  const handleRestaurar = () => {
    setListaConciertos(listaOriginal);
  };

  const handleComprar = (concierto) => {
    if (onComprar) {
      onComprar(concierto);
      return;
    }

    if (concierto.url) {
      window.open(concierto.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative w-full py-4 pb-12">
      {/* 1. Skeleton de carga */}
      {loading && (
        <div className="relative z-10 flex flex-col gap-6">
          <FichaConciertoSkeleton desp="ml-10" />
          <FichaConciertoSkeleton desp="ml-2" />
          <FichaConciertoSkeleton desp="ml-10" />
        </div>
      )}

      {/* 2. Contenido cargado */}
      {!loading && !errorInfo && (
        <div className="relative z-10 flex flex-col gap-6">
          {listaConciertos.length > 0 ? (
            listaConciertos.map((c) => (
              <FichaConcierto
                key={c.id}
                concierto={c}
                onCerrar={handleCerrar}
                onComprar={handleComprar}
              />
            ))
          ) : listaOriginal.length === 0 ? (
            /* Estado vacío real (Ticketmaster no devolvió conciertos) */
            <div className="w-[590px] ml-10 bg-[#d9d9d9] border-2 border-[#111111] shadow-[6px_6px_0_#111111]">
              <div className="bg-[#7b2b3a] px-4 py-2 border-b-2 border-[#111111]">
                <span className="text-[9px] text-white tracking-wider">
                  SIN RESULTADOS
                </span>
              </div>
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <p className="text-[9px] leading-[1.8] text-[#111111]">
                  NO ENCONTRAMOS PRÓXIMOS CONCIERTOS PARA TUS ARTISTAS EN ESTA UBICACIÓN.
                </p>
                <p className="text-[8px] leading-[1.8] text-[#4a1230] bg-[#e0cba5] p-3 border-2 border-[#111111]">
                  INTENTA ACTUALIZAR MÁS TARDE O CAMBIAR DE CIUDAD CUANDO ESTÉ DISPONIBLE.
                </p>
                <button
                  type="button"
                  onClick={fetchConciertos}
                  className="bg-[#8b1f4d] hover:bg-[#a12459] text-white text-[8px] px-4 py-3 border-2 border-[#111111] shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer mt-1"
                >
                  REINTENTAR BÚSQUEDA
                </button>
              </div>
            </div>
          ) : (
            /* El usuario cerró manualmente todas las fichas */
            <div className="w-[590px] ml-10 bg-[#d9d9d9] border-2 border-[#111111] shadow-[6px_6px_0_#111111] p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-[9px] text-[#111111] leading-relaxed">
                OCULTASTE TODOS LOS CONCIERTOS DE ESTA LISTA.
              </p>
              <button
                type="button"
                onClick={handleRestaurar}
                className="bg-[#8b1f4d] hover:bg-[#a12459] text-white text-[8px] px-4 py-3 border-2 border-[#111111] shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                RESTAURAR CONCIERTOS
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vinilo decorativo girando (anclado a la derecha, detrás de las fichas) */}
      <div className="fixed -right-[490px] top-[56%] -translate-y-1/2 w-[980px] h-[980px] z-0 pointer-events-none select-none">
        <img
          src={viniloImg}
          alt="Vinilo decorativo"
          className="w-full h-full object-contain animate-[spin_20s_linear_infinite] drop-shadow-[-7px_7px_0_#111111]"
          style={{ imageRendering: 'pixelated' }}
          draggable="false"
        />
      </div>

      <ErrorModal
        errorInfo={errorInfo}
        onClose={() => setErrorInfo(null)}
        onRetry={fetchConciertos}
      />
    </div>
  );
}