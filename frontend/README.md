# GigMatch - Frontend

Interfaz de usuario desarrollada con **React**, **Vite** y **Tailwind CSS v4** para la plataforma GigMatch.

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado en tu entorno:
- **Node.js**: Versión `>=20.19.0` (Recomendado gestionar con NVM).
- **Python**: Versión `3.10+` (para el servidor de backend).
- **npm** (incluido con Node.js).

---

## 🚀 Guía de Instalación y Ejecución

Para levantar el entorno completo de desarrollo, debes ejecutar el backend y el frontend en terminales separadas.

### 1. Levantar el Backend (FastAPI)

Abre una terminal, navega a la carpeta del backend y configura el entorno virtual:

```bash
cd backend

# Crear y activar el entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows usa: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor de desarrollo
uvicorn main:app --reload
```

> El backend estará disponible en http://localhost:8000


### 2. Levantar el Frontend (React + Vite)

Abre una segunda terminal, navega a la carpeta del frontend e instala las dependencias:

```bash
cd frontend

# Instalar dependencias del proyecto
npm install

# Iniciar el servidor de desarrollo local
npm run dev
```

> La interfaz gráfica estará disponible en http://localhost:5173.