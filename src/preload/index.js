const { contextBridge, ipcRenderer } = require('electron')

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('api', {
    // Gestión de clientes
    crearCliente: (nombre) => ipcRenderer.invoke('client:create', nombre),
    obtenerClientes: () => ipcRenderer.invoke('client:list'),
    actualizarEstado: (clientId, status) => ipcRenderer.invoke('client:updateStatus', clientId, status),
    obtenerRutaCliente: (clientId) => ipcRenderer.invoke('client:getPath', clientId),

    // Nuevas funciones de gestión
    renombrarCliente: (clientId, nuevoNombre) => ipcRenderer.invoke('client:rename', clientId, nuevoNombre),
    eliminarCliente: (clientId) => ipcRenderer.invoke('client:delete', clientId),
    duplicarCliente: (clientId, nuevoNombre) => ipcRenderer.invoke('client:duplicate', clientId, nuevoNombre),
    obtenerDetallesCliente: (clientId) => ipcRenderer.invoke('client:details', clientId),

    // Tareas
    agregarTarea: (clientId, task) => ipcRenderer.invoke('task:add', clientId, task),
    actualizarTarea: (clientId, taskId, updates) => ipcRenderer.invoke('task:update', clientId, taskId, updates),
    eliminarTarea: (clientId, taskId) => ipcRenderer.invoke('task:delete', clientId, taskId),

    // Compresión de video
    comprimirVideo: (inputPath, mode, clientId) => ipcRenderer.invoke('video:compress', inputPath, mode, clientId),

    // Generación de ZIP
    generarZip: (clientId) => ipcRenderer.invoke('zip:generate', clientId),

    // Verificar FFmpeg
    verificarFFmpeg: () => ipcRenderer.invoke('ffmpeg:check'),

    // Eventos de progreso
    onProgresoFFmpeg: (callback) => {
        const listener = (event, progress) => callback(progress)
        ipcRenderer.on('ffmpeg:progress', listener)
        return () => ipcRenderer.removeListener('ffmpeg:progress', listener)
    },

    onProgresoZip: (callback) => {
        const listener = (event, progress) => callback(progress)
        ipcRenderer.on('zip:progress', listener)
        return () => ipcRenderer.removeListener('zip:progress', listener)
    },

    // Abrir carpeta en el explorador de archivos
    abrirCarpeta: (filePath) => ipcRenderer.invoke('shell:showItemInFolder', filePath),

    // Selector de archivos nativo
    seleccionarArchivo: (options) => ipcRenderer.invoke('dialog:selectFile', options)
})

// Exponer información del sistema para drag & drop
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform
})

