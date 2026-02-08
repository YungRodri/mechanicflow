import React from 'react'

function Toolbar({ onCompressVideo, onAddPhoto, onGenerateZip, onOpenFolder, onAddTask, isProcessing, hasClient }) {
    const buttonClass = (enabled) => `
        flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-xl
        transition-all font-medium min-w-[100px]
        ${enabled && !isProcessing
            ? 'bg-mechanic-700/80 hover:bg-mechanic-600 text-white cursor-pointer border border-mechanic-500 hover:border-accent-orange'
            : 'bg-mechanic-800/50 text-mechanic-500 cursor-not-allowed border border-mechanic-700'
        }
    `

    return (
        <div className="flex gap-4 p-4 bg-mechanic-800/60 rounded-2xl border border-mechanic-600 overflow-x-auto">
            <button
                onClick={onCompressVideo}
                disabled={!hasClient || isProcessing}
                className={buttonClass(hasClient)}
                title="Seleccionar y comprimir un video"
            >
                <span className="text-2xl">🎬</span>
                <span className="text-sm">Comprimir</span>
            </button>

            <button
                onClick={onAddPhoto}
                disabled={!hasClient || isProcessing}
                className={buttonClass(hasClient)}
                title="Agregar fotos al cliente"
            >
                <span className="text-2xl">📷</span>
                <span className="text-sm">Foto</span>
            </button>

            <button
                onClick={onGenerateZip}
                disabled={!hasClient || isProcessing}
                className={buttonClass(hasClient)}
                title="Generar paquete ZIP"
            >
                <span className="text-2xl">📦</span>
                <span className="text-sm">Pack</span>
            </button>

            <button
                onClick={onOpenFolder}
                disabled={!hasClient}
                className={buttonClass(hasClient)}
                title="Abrir carpeta del cliente"
            >
                <span className="text-2xl">📁</span>
                <span className="text-sm">Carpeta</span>
            </button>

            <div className="w-px bg-mechanic-600 mx-2"></div>

            <button
                onClick={onAddTask}
                disabled={!hasClient}
                className={`
                    flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-xl
                    transition-all font-medium min-w-[100px]
                    ${hasClient
                        ? 'bg-mechanic-700/80 hover:bg-mechanic-600 text-white cursor-pointer border border-mechanic-500 hover:border-accent-purple'
                        : 'bg-mechanic-800/50 text-mechanic-500 cursor-not-allowed border border-mechanic-700'
                    }
                `}
                title="Agregar nueva tarea"
            >
                <span className="text-2xl">📝</span>
                <span className="text-sm">Tarea</span>
            </button>
        </div>
    )
}

export default Toolbar
