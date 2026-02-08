const {
    createClientFolder, getActiveClients, updateClientStatus, getClientPath,
    renameClient, deleteClient, duplicateClient, getClientDetails,
    addTask, updateTask, deleteTask
} = require('./helpers/filesystem')
const { compressVideo, getFFmpegPath } = require('./helpers/ffmpeg')
const { generateZip } = require('./helpers/zipper')

function setupIPCHandlers(ipcMain) {
    // Crear nuevo cliente
    ipcMain.handle('client:create', async (event, clientName) => {
        try {
            const result = await createClientFolder(clientName)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Obtener lista de clientes activos
    ipcMain.handle('client:list', async () => {
        try {
            const clients = await getActiveClients()
            return { success: true, data: clients }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Actualizar estado de cliente
    ipcMain.handle('client:updateStatus', async (event, clientId, status) => {
        try {
            await updateClientStatus(clientId, status)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Obtener ruta de cliente
    ipcMain.handle('client:getPath', async (event, clientId) => {
        try {
            const clientPath = getClientPath(clientId)
            return { success: true, data: clientPath }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Comprimir video
    ipcMain.handle('video:compress', async (event, inputPath, mode, clientId) => {
        try {
            const result = await compressVideo(inputPath, mode, clientId, (progress) => {
                // Enviar progreso al renderer
                event.sender.send('ffmpeg:progress', progress)
            })
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Generar ZIP
    ipcMain.handle('zip:generate', async (event, clientId) => {
        try {
            const result = await generateZip(clientId, (progress) => {
                event.sender.send('zip:progress', progress)
            })
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Verificar FFmpeg
    ipcMain.handle('ffmpeg:check', async () => {
        try {
            const ffmpegPath = getFFmpegPath()
            const fs = require('fs')
            const exists = fs.existsSync(ffmpegPath)
            return { success: true, data: { path: ffmpegPath, exists } }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Abrir archivo en explorador
    ipcMain.handle('shell:showItemInFolder', async (event, filePath) => {
        try {
            const { shell } = require('electron')
            shell.showItemInFolder(filePath)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Renombrar cliente
    ipcMain.handle('client:rename', async (event, clientId, newName) => {
        try {
            const result = await renameClient(clientId, newName)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Eliminar cliente (mover a papelera)
    ipcMain.handle('client:delete', async (event, clientId) => {
        try {
            const result = await deleteClient(clientId)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Duplicar cliente
    ipcMain.handle('client:duplicate', async (event, clientId, newName) => {
        try {
            const result = await duplicateClient(clientId, newName)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Obtener detalles del cliente
    ipcMain.handle('client:details', async (event, clientId) => {
        try {
            const result = await getClientDetails(clientId)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Tareas
    ipcMain.handle('task:add', async (event, clientId, task) => {
        try {
            const result = await addTask(clientId, task)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('task:update', async (event, clientId, taskId, updates) => {
        try {
            const result = await updateTask(clientId, taskId, updates)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('task:delete', async (event, clientId, taskId) => {
        try {
            const result = await deleteTask(clientId, taskId)
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    // Seleccionar archivo con diálogo nativo
    ipcMain.handle('dialog:selectFile', async (event, options) => {
        try {
            const { dialog } = require('electron')
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: options?.filters || [
                    { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
                    { name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
                    { name: 'Todos', extensions: ['*'] }
                ]
            })
            if (result.canceled) {
                return { success: true, data: null }
            }
            return { success: true, data: result.filePaths[0] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })
}

module.exports = { setupIPCHandlers }

