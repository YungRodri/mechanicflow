const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { setupIPCHandlers } = require('./ipc-handlers')

// Determinar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development'
const VITE_DEV_URL = 'http://localhost:5173'

let mainWindow

/**
 * Espera a que una URL esté disponible antes de cargarla
 * @param {BrowserWindow} win - La ventana de Electron
 * @param {string} url - La URL a cargar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} retryDelay - Milisegundos entre reintentos
 */
async function loadURLWithRetry(win, url, maxRetries = 15, retryDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await win.loadURL(url)
            console.log(`✓ Conectado a ${url} en el intento ${attempt}`)
            return true
        } catch (error) {
            if (error.code === 'ERR_CONNECTION_REFUSED' || error.code === 'ERR_CONNECTION_FAILED') {
                console.log(`⏳ Esperando servidor Vite... intento ${attempt}/${maxRetries}`)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay))
                } else {
                    console.error(`✗ No se pudo conectar a ${url} después de ${maxRetries} intentos`)
                    throw error
                }
            } else {
                throw error
            }
        }
    }
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        backgroundColor: '#0a0a0f',
        titleBarStyle: 'hiddenInset',
        frame: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/index.js')
        }
    })

    // Cargar la aplicación
    if (isDev) {
        await loadURLWithRetry(mainWindow, VITE_DEV_URL)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.whenReady().then(async () => {
    // Configurar handlers IPC antes de crear la ventana
    setupIPCHandlers(ipcMain)

    try {
        await createWindow()
    } catch (error) {
        console.error('Error al crear la ventana:', error)
        app.quit()
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Exportar ventana principal para uso en otros módulos
module.exports = { getMainWindow: () => mainWindow }
