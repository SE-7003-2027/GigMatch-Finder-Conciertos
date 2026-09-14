import { useState, useEffect } from 'react'

function App() {
  // Aquí guardaremos la respuesta que nos dé el backend
  const [mensajeBackend, setMensajeBackend] = useState("Cargando conexión...")

  // useEffect hace que esta llamada suceda una sola vez al cargar la pantalla
  useEffect(() => {
    // React viaja al puerto 8000 y toca la puerta de FastAPI
    fetch("http://localhost:8000/")
      .then(respuesta => {
        if (!respuesta.ok) throw new Error("Error HTTP: " + respuesta.status);
        return respuesta.json();
      })
      .then(datos => {
        // Guardamos el mensaje del JSON en nuestra variable de estado
        setMensajeBackend(datos.mensaje)
      })
      .catch(error => {
        console.error("Error al conectar con FastAPI:", error)
        setMensajeBackend("Error de conexión ❌")
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="p-8 bg-gray-800 rounded-xl shadow-lg text-center border border-gray-700">
        <h1 className="text-5xl font-bold text-green-400 mb-6">
          GigMatch
        </h1>
        
        {/* Aquí mostramos dinámicamente lo que respondió el backend */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Mensaje desde FastAPI:</p>
          <p className="text-xl text-white font-mono">
            {mensajeBackend}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App