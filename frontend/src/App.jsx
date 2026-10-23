import { useState } from 'react';
import './index.css';
import Login from './components/Login';
import {
  getStoredUser,
  clearStoredUser,
  parseAuthUrlParams,
} from './services/authService';

/**
 * Componente Principal de la Aplicación.
 * Estilizado completamente con Tailwind CSS.
 */
export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const { user } = parseAuthUrlParams();
    return user || getStoredUser();
  });

  const handleLogout = () => {
    clearStoredUser();
    setUsuario(null);
  };

  // Si el usuario no ha iniciado sesión, mostramos la pantalla de Login
  if (!usuario) {
    return <Login onLoginSuccess={setUsuario} />;
  }

  // Vista autenticada del usuario (preparada para mostrar sus artistas principales)
  return (
    <div className="relative min-h-screen w-full bg-[#6798a8]">
      {/* Encabezado retro */}
      <header className="w-full h-[100px] bg-[#e0cba5] px-10 flex items-center justify-between border-b-4 border-[#111111]/20">
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
            onClick={handleLogout}
            title="Cerrar sesión de Spotify"
          >
            CERRAR SESIÓN
          </button>
        </div>
      </header>

      {/* Tarjeta de bienvenida y estado de conexión */}
      <main className="max-w-[700px] mx-auto my-14 px-4">
        <section className="w-full bg-[#d9d9d9] border-4 border-[#111111] shadow-[8px_8px_0_#111111]">
          <div className="bg-[#7b2b3a] text-white px-3.5 py-2 text-[9px] flex items-center justify-between">
            <span>SESIÓN INICIADA CON SPOTIFY</span>
          </div>
          <div className="p-8 text-center text-[9px] leading-loose">
            <p>
              ¡Hola, <strong className="text-[#8b1f4d]">{usuario.nombre}</strong>!
            </p>
            <p className="mt-3">
              Tu cuenta de Spotify (<span className="text-[#8b1f4d] font-bold">{usuario.id_spotify}</span>) ha sido vinculada correctamente.
            </p>
            <p className="mt-4 text-[8px] text-[#444444]">
              A continuación conectaremos la consulta de tus artistas principales con el endpoint:
            </p>
            <div className="mt-3">
              <code className="bg-[#e0cba5] text-[#111111] px-3 py-1.5 border border-[#111111] inline-block text-[8px]">
                GET /spotify/{usuario.id_spotify}/top-artists
              </code>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}