# MechanicFlow 🔧🚙

**MechanicFlow** es un sistema de gestión de evidencia multimedia diseñado específicamente para talleres mecánicos. Funciona como una "caja negra digital" que organiza, comprime y asegura todas las fotos y videos de las reparaciones, protegiendo tanto al taller como al cliente.

## 🚀 Características Principales

*   **100% Offline:** Funciona totalmente local en tu equipo, sin depender de internet ni suscripciones en la nube.
*   **Organización Automática:** Clasifica archivos por `Cliente > Vehículo > Orden de Trabajo`.
*   **Compresión Inteligente:** Usa `ffmpeg` para reducir el peso de los videos sin perder calidad visible.
*   **Multi-plataforma:** Construido con Electron, compatible con Windows (principal), macOS y Linux.

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

1.  **Node.js** (v16 o superior): [Descargar aquí](https://nodejs.org/)
2.  **Git**: [Descargar aquí](https://git-scm.com/)
3.  **FFmpeg**: Necesario para la compresión de video. Debe estar disponible en el PATH del sistema.

## 🛠️ Instalación y Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en tu computadora:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/YungRodri/mechanicflow.git
    cd mechanicflow
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```
    *Esto abrirá la aplicación en una ventana de Electron con herramientas de desarrollo activadas.*

## 📦 Construir para Producción

Para generar el ejecutable (`.exe`) del programa:

```bash
npm run build
# Luego empaquetar
npm run package
```
El instalador quedará en la carpeta `dist/` o `release/`.

## 🤝 Cómo Contribuir

¡Gracias por querer mejorar MechanicFlow! Sigue este flujo de trabajo profesional para enviar tus cambios:

1.  **Hacer un Fork** del proyecto (botón "Fork" arriba a la derecha en GitHub).
2.  **Clonar tu Fork** a tu PC.
3.  **Crear una Rama (Branch)** para tu mejora:
    ```bash
    git checkout -b feature/nueva-funcionalidad
    # o para errores
    git checkout -b fix/reparar-error
    ```
4.  **Hacer tus cambios** y guardarlos (Commit):
    ```bash
    git add .
    git commit -m "feat: descripción clara de lo que agregaste"
    ```
5.  **Subir cambios** a tu repositorio (Push):
    ```bash
    git push origin feature/nueva-funcionalidad
    ```
6.  **Crear un Pull Request (PR):** Ve a GitHub y abre un "Compare & pull request" hacia la rama `main` del proyecto original.

## 📂 Estructura del Proyecto

*   `src/main/`: Código del proceso principal (Electron, manejo de archivos, sistema operativo).
*   `src/renderer/`: Código de la interfaz de usuario (React, Vite, CSS).
*   `src/preload/`: Puente de seguridad entre el Main y el Renderer.

---
Desarrollado con ❤️ para mecánicos que valoran su trabajo.