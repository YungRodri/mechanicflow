# PROMPT

# ROL
Actúa como un Arquitecto de Software Senior y Desarrollador Experto en Electron y Node.js. Tu objetivo es construir el MVP (Producto Mínimo Viable) de una aplicación de escritorio llamada "MechanicFlow".

# CONTEXTO DEL PROYECTO
"MechanicFlow" es una herramienta "Local-First" para talleres mecánicos que gestiona la ingesta, compresión y organización de evidencia multimedia (fotos y videos) de reparaciones de maquinaria pesada. La prioridad es la robustez, la simplicidad de uso para personal no técnico y la gestión eficiente del almacenamiento local.

# STACK TECNOLÓGICO (ESTRICTO)
- Framework: Electron (usando Electron Forge con plantilla Vite + React o Vanilla JS, lo que sea más ligero).
- Runtime: Node.js (para acceso al sistema de archivos).
- Procesamiento de Video: fluent-ffmpeg (Wrapper para FFmpeg).
- Base de Datos Local: lowdb (vía JSON local) para gestión de clientes y estados.
- Compresión de Archivos: archiver (para generar ZIPs).
- Estilos: TailwindCSS (para una UI rápida y moderna).

# REQUISITOS FUNCIONALES (Paso a Paso)

## 1. Estructura y Configuración (Backend/Main Process)
- Configura el manejo de `ffmpeg.exe` estático. El sistema debe detectar si está en modo 'desarrollo' o 'producción' para encontrar la ruta correcta del binario de FFmpeg dentro de la carpeta `resources`.
- Implementa el patrón IPC (Inter-Process Communication) para separar la lógica del frontend.

## 2. Gestión de Clientes (Sistema de Archivos)
- Crea una función que genere una estructura de carpetas local: `Documentos/MechanicFlow/[Nombre_Cliente]/[Fecha_Orden]`.
- Al iniciar, la app debe leer estas carpetas y mostrarlas como "Trabajos Activos".

## 3. Lógica de Compresión de Video (Core Feature)
Implementa una función en el Main Process que acepte un archivo de video y un "Modo". Usa `fluent-ffmpeg` con las siguientes configuraciones de mapa de bits (CRF):

- **Modo DETALLE:**
  - Config: `-c:v libx264 -crf 20 -preset fast`
  - Resolución: Mantener original (No escalar).
  - Uso: Para tuercas, roscas, fisuras.

- **Modo GENERAL:**
  - Config: `-c:v libx264 -crf 24 -preset fast`
  - Resolución: Escalar a 1080p (`scale=-1:1080`) si el original es mayor.
  - Uso: Vistas generales de la máquina.

- **Modo RÁPIDO:**
  - Config: `-c:v libx264 -crf 28 -preset ultrafast`
  - Resolución: Escalar a 720p (`scale=-1:720`).
  - Uso: Reportes largos o audio.

## 4. Generación de Entregables ("El Pack")
- Implementa una función que tome todos los archivos *procesados* de la carpeta de un cliente.
- Comprime todo en un archivo `.zip` con el nombre `Reporte_[Cliente]_[Fecha].zip`.

## 5. Interfaz de Usuario (Frontend/Renderer)
Diseña una UI oscura (Dark Mode), industrial y minimalista:
- **Sidebar Izquierdo:** Lista de Clientes Activos + Botón "Nuevo Cliente".
- **Área Central:** Zona gigante de "Drag & Drop".
- **Modal de Selección:** Al soltar un archivo, debe aparecer un modal preguntando: "¿Qué tipo de video es?" con 3 botones grandes (Detalle, General, Rápido).
- **Barra de Progreso:** Feedback visual real del progreso de FFmpeg.
- **Panel de Estado:** Una línea de tiempo simple con checkboxes: "Recepción", "Desarme", "Reparación", "Listo". (Esto solo actualiza el JSON local por ahora).

# INSTRUCCIONES DE EJECUCIÓN
1. Inicializa el proyecto con el scaffolding necesario.
2. Crea primero los "Helpers" de Node.js para el manejo de archivos y FFmpeg.
3. Configura el puente IPC (`preload.js`) exponiendo solo las funciones necesarias (`comprimirVideo`, `crearCliente`, `generarZip`).
4. Construye la interfaz visual conectada a estas funciones.

IMPORTANTE: Asume que tengo el archivo `ffmpeg.exe` listo para colocar en la carpeta del proyecto. Dime exactamente en qué carpeta debo ponerlo una vez que generes la estructura.