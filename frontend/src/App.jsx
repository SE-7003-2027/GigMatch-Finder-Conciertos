import { useState } from "react";
import './index.css'
import Login from "./components/Login";
import TopArtistsView from "./components/TopArtistsView";
import MainLayout from './components/MainLayout';
import { getStoredUser, clearStoredUser, parseAuthUrlParams } from './services/authService';

export default function App() {
    const [usuario, setUsuario] = useState(() => {
        const { user } = parseAuthUrlParams();
        return user || getStoredUser();
    });

    const [vistaActual, setVistaActual] = useState('artistas');

    const handleLogout = () => {
        clearStoredUser();
        setUsuario(null);
        setVistaActual('artista');
    };

    if (!usuario) {
        return <Login onLoginSuccess={setUsuario} />;
    }

    return (
        <MainLayout
            usuario={usuario}
            onLogout={handleLogout}
            vistaActual={vistaActual}
            setVistaActual={setVistaActual}
        >
            {vistaActual === 'artistas' && (
                <TopArtistsView
                    idSpotify={usuario.id_spotify}
                    onContinue={() => setVistaActual('recomendaciones')}
                />
            )}

            {vistaActual === 'recomendaciones' && (
                <p>Recomendaciones de conciertos</p>
            )}
        </MainLayout>
    );
}
