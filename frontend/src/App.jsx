import './index.css';

// "desp" controla el desfase de cada ficha (desp-1 o desp-2)
// "foto" es opcional: se usa como imagen de fondo
const CONCIERTOS = [
  {
    id: 1,
    nombre: 'FESTIVAL',
    fechas: '25 Y 26 DE SEPTIEMBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    desp: 'desp-1',
    logo: true,
  },
  {
    id: 2,
    nombre: 'YOUNG MIKO',
    fechas: '22 DE SEPTIEMBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    desp: 'desp-2',
  },
  {
    id: 3,
    nombre: 'MOTORAMA',
    fechas: '01 DE OCTUBRE DE 2026',
    sede: 'PALACIO DE LOS DEPORTES',
    desp: 'desp-1',
  },
];

function Campo({ etiqueta, valor, icono, nombre = false }) {
  return (
    <div className="campo-info">
      <span className="etiqueta">{etiqueta}</span>
      <div className={`caja-valor${nombre ? ' nombre' : ''}`}>
        <span>{valor}</span>
        <span className={`pixel-icon ${icono}`}></span>
      </div>
    </div>
  );
}

function FichaConcierto({ concierto, onCerrar, onComprar }) {
  const { nombre, fechas, sede, desp, logo, foto } = concierto;

  return (
    <section className={`ventana-concierto ${desp}`}>
      <div className="barra-ventana">
        <span>CONCIERTO</span>
        <button className="btn-cerrar" onClick={() => onCerrar?.(concierto)}>X</button>
      </div>

      <div className="contenido-ventana">
        <div className="col-izquierda">
          <div
            className={`foto-artista${logo ? ' logo' : ''}`}
            style={foto ? { backgroundImage: `url(${foto})` } : undefined}
          ></div>
          <button className="btn-comprar" onClick={() => onComprar?.(concierto)}>
            COMPRAR BOLETOS
          </button>
        </div>

        <div className="col-derecha">
          <Campo etiqueta="ARTISTA /FESTIVAL:" valor={nombre} icono="flecha-guinda" nombre />
          <Campo etiqueta="FECHA(S)" valor={fechas} icono="corazon-pixel-css" />
          <Campo etiqueta="SEDE" valor={sede} icono="mapa-pixel-css" />
        </div>
      </div>
    </section>
  );
}

export default function Recomendaciones({ conciertos = CONCIERTOS }) {
  return (
    <div className="pagina">
      {/* Encabezado */}
      <header className="encabezado">
        <h1 className="titulo-principal">PROXIMOS CONCIERTOS</h1>
        <nav className="botones-navegacion">
          <button className="btn-nav">TUS ARTISTAS</button>
          <button className="btn-nav activo">RECOMENDACIONES</button>
        </nav>
      </header>

      {/* fichas */}
      <div className="contenedor-principal">
        <main className="lista-conciertos">
          {conciertos.map((c) => (
            <FichaConcierto key={c.id} concierto={c} />
          ))}
        </main>
      </div>

      {/* vinilo */}
      <div className="seccion-vinilo">
        <div className="vinyl-container">
          <div className="vinyl-center-hole"></div>
        </div>
      </div>
    </div>
  );
}