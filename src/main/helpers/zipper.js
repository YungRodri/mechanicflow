const archiver = require('archiver')
const fs = require('fs')
const path = require('path')
const { getClientPath } = require('./filesystem')

/**
 * Genera un archivo ZIP con todos los archivos procesados de un cliente
 * @param {string} clientId - ID del cliente
 * @param {function} onProgress - Callback para reportar progreso
 * @returns {Promise<object>} - Resultado con ruta del ZIP generado
 */
async function generateZip(clientId, onProgress) {
    return new Promise((resolve, reject) => {
        const clientPath = getClientPath(clientId)
        const processedPath = path.join(clientPath, 'procesados')
        const fotosPath = path.join(clientPath, 'fotos')

        // Verificar que existen archivos
        if (!fs.existsSync(processedPath) && !fs.existsSync(fotosPath)) {
            reject(new Error('No hay archivos para comprimir'))
            return
        }

        // Leer metadata para obtener nombre del cliente
        const metaPath = path.join(clientPath, 'metadata.json')
        let clientName = 'Cliente'
        let date = new Date().toISOString().split('T')[0]

        if (fs.existsSync(metaPath)) {
            const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
            clientName = metadata.name.replace(/[<>:"/\\|?*]/g, '_')
            date = path.basename(clientPath)
        }

        // Crear nombre del ZIP
        const zipName = `Reporte_${clientName}_${date}.zip`
        const zipPath = path.join(clientPath, zipName)

        // Crear stream de salida
        const output = fs.createWriteStream(zipPath)
        const archive = archiver('zip', {
            zlib: { level: 6 } // Nivel de compresión medio
        })

        // Manejar eventos
        output.on('close', () => {
            resolve({
                path: zipPath,
                name: zipName,
                size: archive.pointer(),
                clientId
            })
        })

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('Archivo no encontrado durante compresión:', err)
            } else {
                reject(err)
            }
        })

        archive.on('error', (err) => {
            reject(err)
        })

        archive.on('progress', (progress) => {
            if (onProgress) {
                const percent = Math.round((progress.entries.processed / progress.entries.total) * 100)
                onProgress({
                    percent,
                    processed: progress.entries.processed,
                    total: progress.entries.total
                })
            }
        })

        // Conectar archive con output
        archive.pipe(output)

        // Agregar carpeta de videos procesados
        if (fs.existsSync(processedPath)) {
            const files = fs.readdirSync(processedPath)
            if (files.length > 0) {
                archive.directory(processedPath, 'Videos')
            }
        }

        // Agregar carpeta de fotos
        if (fs.existsSync(fotosPath)) {
            const files = fs.readdirSync(fotosPath)
            if (files.length > 0) {
                archive.directory(fotosPath, 'Fotos')
            }
        }

        // Agregar metadata como resumen
        if (fs.existsSync(metaPath)) {
            archive.file(metaPath, { name: 'resumen.json' })
        }

        // Finalizar
        archive.finalize()
    })
}

module.exports = { generateZip }
