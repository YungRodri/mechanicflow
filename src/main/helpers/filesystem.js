const fs = require('fs')
const path = require('path')
const os = require('os')

// Ruta base de MechanicFlow en Documentos
const MECHANICFLOW_BASE = path.join(os.homedir(), 'Documents', 'MechanicFlow')

// Caché de clientes activos
let clientsCache = null

/**
 * Asegura que el directorio base existe
 */
function ensureBaseDirectory() {
    if (!fs.existsSync(MECHANICFLOW_BASE)) {
        fs.mkdirSync(MECHANICFLOW_BASE, { recursive: true })
    }
}

/**
 * Genera una fecha formateada para nombres de carpeta
 */
function getFormattedDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Crea una nueva carpeta de cliente con estructura
 * @param {string} clientName - Nombre del cliente
 * @returns {object} - Información del cliente creado
 */
async function createClientFolder(clientName) {
    ensureBaseDirectory()

    // Sanitizar nombre del cliente
    const sanitizedName = clientName.replace(/[<>:"/\\|?*]/g, '_').trim()
    const date = getFormattedDate()
    const clientId = `${sanitizedName}_${date}_${Date.now()}`

    const clientPath = path.join(MECHANICFLOW_BASE, sanitizedName, date)

    // Crear estructura de carpetas
    const subfolders = ['originales', 'procesados', 'fotos']

    for (const folder of subfolders) {
        const folderPath = path.join(clientPath, folder)
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
        }
    }

    // Crear archivo de metadatos
    const metadata = {
        id: clientId,
        name: clientName,
        createdAt: new Date().toISOString(),
        status: {
            recepcion: false,
            desarme: false,
            reparacion: false,
            listo: false
        },
        files: []
    }

    const metaPath = path.join(clientPath, 'metadata.json')
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')

    // Invalidar caché
    clientsCache = null

    return {
        id: clientId,
        name: clientName,
        path: clientPath,
        date,
        status: metadata.status
    }
}

/**
 * Obtiene la ruta de un cliente por su ID
 * @param {string} clientId - ID del cliente (formato: nombre_fecha_timestamp)
 * @returns {string} - Ruta absoluta de la carpeta del cliente
 */
function getClientPath(clientId) {
    const parts = clientId.split('_')
    const timestamp = parts.pop()
    const date = parts.pop()
    const name = parts.join('_')

    return path.join(MECHANICFLOW_BASE, name, date)
}

/**
 * Obtiene todos los clientes activos del sistema de archivos
 * @returns {Array} - Lista de clientes con su información
 */
async function getActiveClients() {
    ensureBaseDirectory()

    const clients = []

    // Recorrer carpetas de clientes (excluir carpetas que inician con _)
    const clientFolders = fs.readdirSync(MECHANICFLOW_BASE, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))

    for (const clientFolder of clientFolders) {
        const clientName = clientFolder.name
        const clientBasePath = path.join(MECHANICFLOW_BASE, clientName)

        // Buscar subcarpetas de fechas
        const dateFolders = fs.readdirSync(clientBasePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())

        for (const dateFolder of dateFolders) {
            const date = dateFolder.name
            const workPath = path.join(clientBasePath, date)
            const metaPath = path.join(workPath, 'metadata.json')

            if (fs.existsSync(metaPath)) {
                try {
                    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

                    // Contar archivos procesados
                    const processedPath = path.join(workPath, 'procesados')
                    let processedCount = 0
                    if (fs.existsSync(processedPath)) {
                        processedCount = fs.readdirSync(processedPath).length
                    }

                    clients.push({
                        id: metadata.id,
                        name: metadata.name,
                        path: workPath,
                        date,
                        createdAt: metadata.createdAt,
                        status: metadata.status,
                        processedCount,
                        tasks: metadata.tasks || []
                    })
                } catch (error) {
                    console.error(`Error leyendo metadata de ${workPath}:`, error)
                }
            }
        }
    }

    // Ordenar por fecha de creación (más reciente primero)
    clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    clientsCache = clients
    return clients
}

/**
 * Actualiza el estado de un cliente
 * @param {string} clientId - ID del cliente
 * @param {object} status - Nuevo estado {recepcion, desarme, reparacion, listo}
 */
async function updateClientStatus(clientId, status) {
    const clientPath = getClientPath(clientId)
    const metaPath = path.join(clientPath, 'metadata.json')

    if (!fs.existsSync(metaPath)) {
        throw new Error(`Cliente no encontrado: ${clientId}`)
    }

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    metadata.status = { ...metadata.status, ...status }
    metadata.updatedAt = new Date().toISOString()

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')

    // Invalidar caché
    clientsCache = null

    return metadata.status
}

/**
 * Agrega registro de archivo al metadata del cliente
 */
async function addFileToClient(clientId, fileInfo) {
    const clientPath = getClientPath(clientId)
    const metaPath = path.join(clientPath, 'metadata.json')

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    metadata.files.push({
        ...fileInfo,
        addedAt: new Date().toISOString()
    })

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')
}

/**
 * Renombra un cliente
 * @param {string} clientId - ID del cliente
 * @param {string} newName - Nuevo nombre
 */
async function renameClient(clientId, newName) {
    const clientPath = getClientPath(clientId)
    const metaPath = path.join(clientPath, 'metadata.json')

    if (!fs.existsSync(metaPath)) {
        throw new Error(`Cliente no encontrado: ${clientId}`)
    }

    // Actualizar metadata
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    const oldName = metadata.name
    metadata.name = newName
    metadata.updatedAt = new Date().toISOString()

    // Actualizar el ID con el nuevo nombre
    const parts = clientId.split('_')
    const timestamp = parts.pop()
    const date = parts.pop()
    const newId = `${newName.replace(/[<>:"/\\|?*]/g, '_')}_${date}_${timestamp}`
    metadata.id = newId

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')

    // Renombrar carpeta padre (nombre del cliente)
    const sanitizedNewName = newName.replace(/[<>:"/\\|?*]/g, '_').trim()
    const sanitizedOldName = oldName.replace(/[<>:"/\\|?*]/g, '_').trim()
    const oldParentPath = path.join(MECHANICFLOW_BASE, sanitizedOldName)
    const newParentPath = path.join(MECHANICFLOW_BASE, sanitizedNewName)

    if (oldParentPath !== newParentPath && fs.existsSync(oldParentPath)) {
        fs.renameSync(oldParentPath, newParentPath)
    }

    // Invalidar caché
    clientsCache = null

    return { id: newId, name: newName }
}

/**
 * Elimina un cliente (mueve a papelera)
 * @param {string} clientId - ID del cliente
 */
async function deleteClient(clientId) {
    const clientPath = getClientPath(clientId)

    if (!fs.existsSync(clientPath)) {
        throw new Error(`Cliente no encontrado: ${clientId}`)
    }

    // Crear carpeta de papelera si no existe
    const trashPath = path.join(MECHANICFLOW_BASE, '_Papelera')
    if (!fs.existsSync(trashPath)) {
        fs.mkdirSync(trashPath, { recursive: true })
    }

    // Leer metadata para obtener nombre
    const metaPath = path.join(clientPath, 'metadata.json')
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    // Crear nombre único para la papelera
    const trashName = `${metadata.name}_${Date.now()}`
    const destPath = path.join(trashPath, trashName)

    // Mover carpeta a papelera
    fs.renameSync(clientPath, destPath)

    // Limpiar carpeta padre si está vacía
    const parts = clientId.split('_')
    parts.pop() // timestamp
    parts.pop() // date
    const parentName = parts.join('_')
    const parentPath = path.join(MECHANICFLOW_BASE, parentName)

    if (fs.existsSync(parentPath)) {
        const remaining = fs.readdirSync(parentPath)
        if (remaining.length === 0) {
            fs.rmdirSync(parentPath)
        }
    }

    // Invalidar caché
    clientsCache = null

    return { deleted: true, movedTo: destPath }
}

/**
 * Duplica un cliente
 * @param {string} clientId - ID del cliente a duplicar
 * @param {string} newName - Nombre para la copia (opcional)
 */
async function duplicateClient(clientId, newName = null) {
    const sourcePath = getClientPath(clientId)

    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Cliente no encontrado: ${clientId}`)
    }

    // Leer metadata original
    const metaPath = path.join(sourcePath, 'metadata.json')
    const originalMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    // Crear nuevo cliente
    const copyName = newName || `${originalMeta.name} (copia)`
    const newClient = await createClientFolder(copyName)

    // Copiar archivos de cada subcarpeta
    const subfolders = ['originales', 'procesados', 'fotos']

    for (const folder of subfolders) {
        const sourceFolder = path.join(sourcePath, folder)
        const destFolder = path.join(newClient.path, folder)

        if (fs.existsSync(sourceFolder)) {
            const files = fs.readdirSync(sourceFolder)
            for (const file of files) {
                const srcFile = path.join(sourceFolder, file)
                const dstFile = path.join(destFolder, file)
                fs.copyFileSync(srcFile, dstFile)
            }
        }
    }

    // Actualizar metadata de la copia con archivos copiados
    const newMetaPath = path.join(newClient.path, 'metadata.json')
    const newMeta = JSON.parse(fs.readFileSync(newMetaPath, 'utf8'))
    newMeta.files = originalMeta.files || []
    newMeta.copiedFrom = clientId
    fs.writeFileSync(newMetaPath, JSON.stringify(newMeta, null, 2), 'utf8')

    // Invalidar caché
    clientsCache = null

    return newClient
}

/**
 * Obtiene detalles de un cliente
 * @param {string} clientId - ID del cliente
 */
async function getClientDetails(clientId) {
    const clientPath = getClientPath(clientId)

    if (!fs.existsSync(clientPath)) {
        throw new Error(`Cliente no encontrado: ${clientId}`)
    }

    const metaPath = path.join(clientPath, 'metadata.json')
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    // Calcular tamaño total
    let totalSize = 0
    let fileCount = 0

    const calculateSize = (dirPath) => {
        if (!fs.existsSync(dirPath)) return
        const items = fs.readdirSync(dirPath, { withFileTypes: true })
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name)
            if (item.isFile()) {
                totalSize += fs.statSync(fullPath).size
                fileCount++
            } else if (item.isDirectory()) {
                calculateSize(fullPath)
            }
        }
    }

    calculateSize(clientPath)

    // Contar archivos por tipo
    const getFileCount = (folder) => {
        const folderPath = path.join(clientPath, folder)
        if (!fs.existsSync(folderPath)) return 0
        return fs.readdirSync(folderPath).length
    }

    return {
        id: metadata.id,
        name: metadata.name,
        path: clientPath,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
        status: metadata.status,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        fileCount,
        originales: getFileCount('originales'),
        procesados: getFileCount('procesados'),
        fotos: getFileCount('fotos')
    }
}

/**
 * Formatea bytes a tamaño legible
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Agrega una tarea a un cliente
 */
async function addTask(clientId, task) {
    const clientPath = getClientPath(clientId)
    const metaPath = path.join(clientPath, 'metadata.json')

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    if (!metadata.tasks) metadata.tasks = []

    const newTask = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...task
    }

    metadata.tasks.push(newTask)
    metadata.updatedAt = new Date().toISOString()

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')
    return newTask
}

/**
 * Actualiza una tarea existente
 */
async function updateTask(clientId, taskId, updates) {
    const clientPath = getClientPath(clientId)
    const metaPath = path.join(clientPath, 'metadata.json')

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    if (!metadata.tasks) return null

    const taskIndex = metadata.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) throw new Error('Tarea no encontrada')

    metadata.tasks[taskIndex] = {
        ...metadata.tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    }
    metadata.updatedAt = new Date().toISOString()

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')
    return metadata.tasks[taskIndex]
}

/**
 * Elimina una tarea
 */
async function deleteTask(clientId, taskId) {
    const clientPath = getClientPath(clientId)
    const metaPath = path.join(clientPath, 'metadata.json')

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    if (!metadata.tasks) return

    metadata.tasks = metadata.tasks.filter(t => t.id !== taskId)
    metadata.updatedAt = new Date().toISOString()

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8')
    return { success: true }
}

module.exports = {
    MECHANICFLOW_BASE,
    createClientFolder,
    getClientPath,
    getActiveClients,
    updateClientStatus,
    addFileToClient,
    ensureBaseDirectory,
    renameClient,
    deleteClient,
    duplicateClient,
    getClientDetails,
    addTask,
    updateTask,
    deleteTask
}

