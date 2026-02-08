const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')
const { app } = require('electron')
const { getClientPath } = require('./filesystem')

/**
 * Obtiene la ruta de FFmpeg según el entorno (dev/prod)
 */
function getFFmpegPath() {
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
        // En desarrollo, buscar en resources/ffmpeg
        return path.join(process.cwd(), 'resources', 'ffmpeg', 'ffmpeg.exe')
    } else {
        // En producción, buscar en resources dentro del .asar
        return path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe')
    }
}

/**
 * Configura FFmpeg con la ruta correcta
 */
function setupFFmpeg() {
    const ffmpegPath = getFFmpegPath()

    if (fs.existsSync(ffmpegPath)) {
        ffmpeg.setFfmpegPath(ffmpegPath)
        return true
    }

    console.warn('FFmpeg no encontrado en:', ffmpegPath)
    return false
}

// Configuraciones de compresión por modo
const COMPRESSION_MODES = {
    DETALLE: {
        crf: 20,
        preset: 'fast',
        scale: null, // Mantener resolución original
        description: 'Alta calidad para detalles (tuercas, fisuras)'
    },
    GENERAL: {
        crf: 24,
        preset: 'fast',
        scale: 1080, // Escalar a 1080p si es mayor
        description: 'Calidad media para vistas generales'
    },
    RAPIDO: {
        crf: 28,
        preset: 'ultrafast',
        scale: 720, // Escalar a 720p
        description: 'Compresión máxima para reportes largos'
    }
}

/**
 * Comprime un video según el modo especificado
 * @param {string} inputPath - Ruta del video original
 * @param {string} mode - Modo de compresión: DETALLE, GENERAL, RAPIDO
 * @param {string} clientId - ID del cliente para guardar el resultado
 * @param {function} onProgress - Callback para reportar progreso
 * @returns {Promise<object>} - Resultado con ruta del video comprimido
 */
async function compressVideo(inputPath, mode, clientId, onProgress) {
    return new Promise((resolve, reject) => {
        // Verificar que FFmpeg existe
        if (!setupFFmpeg()) {
            reject(new Error('FFmpeg no está disponible. Coloca ffmpeg.exe en resources/ffmpeg/'))
            return
        }

        const modeConfig = COMPRESSION_MODES[mode.toUpperCase()]
        if (!modeConfig) {
            reject(new Error(`Modo de compresión inválido: ${mode}`))
            return
        }

        // Preparar rutas
        const clientPath = getClientPath(clientId)
        const inputFileName = path.basename(inputPath, path.extname(inputPath))
        const outputFileName = `${inputFileName}_${mode.toLowerCase()}.mp4`
        const outputPath = path.join(clientPath, 'procesados', outputFileName)

        // Crear carpeta de procesados si no existe
        const processedDir = path.join(clientPath, 'procesados')
        if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir, { recursive: true })
        }

        // Configurar comando FFmpeg
        let command = ffmpeg(inputPath)
            .videoCodec('libx264')
            .addOption('-crf', modeConfig.crf.toString())
            .addOption('-preset', modeConfig.preset)
            .audioCodec('aac')
            .audioBitrate('128k')

        // Aplicar escalado si es necesario (-2 asegura dimensiones pares para H.264)
        if (modeConfig.scale) {
            command = command.addOption('-vf', `scale=-2:${modeConfig.scale}`)
        }

        command
            .output(outputPath)
            .on('start', (cmd) => {
                console.log('FFmpeg iniciado:', cmd)
            })
            .on('progress', (progress) => {
                if (onProgress && progress.percent) {
                    onProgress({
                        percent: Math.round(progress.percent),
                        timemark: progress.timemark
                    })
                }
            })
            .on('end', () => {
                // Obtener tamaños para mostrar ahorro
                const inputStats = fs.statSync(inputPath)
                const outputStats = fs.statSync(outputPath)
                const savedPercent = Math.round((1 - outputStats.size / inputStats.size) * 100)

                resolve({
                    inputPath,
                    outputPath,
                    mode,
                    inputSize: inputStats.size,
                    outputSize: outputStats.size,
                    savedPercent
                })
            })
            .on('error', (err) => {
                reject(new Error(`Error de FFmpeg: ${err.message}`))
            })
            .run()
    })
}

module.exports = {
    getFFmpegPath,
    setupFFmpeg,
    compressVideo,
    COMPRESSION_MODES
}
