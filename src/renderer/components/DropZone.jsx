import React, { useState, useCallback } from 'react'

function DropZone({ onFileDrop, isProcessing, hasClient }) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isProcessing && hasClient) {
            setIsDragOver(true)
        }
    }, [isProcessing, hasClient])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        if (isProcessing || !hasClient) return

        const files = Array.from(e.dataTransfer.files)
        const videoFile = files.find(file =>
            file.type.startsWith('video/') ||
            /\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i.test(file.name)
        )

        if (videoFile) {
            onFileDrop(videoFile.path)
        }
    }, [onFileDrop, isProcessing, hasClient])

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative h-full rounded-2xl border-2 border-dashed 
        transition-[border-color,background-color,transform] duration-300 flex flex-col items-center justify-center
        ${isProcessing
                    ? 'border-accent-orange/50 bg-mechanic-800/50 cursor-wait'
                    : isDragOver
                        ? 'border-accent-orange bg-accent-orange/10 scale-[1.02]'
                        : hasClient
                            ? 'border-mechanic-500 bg-mechanic-800/30 hover:border-mechanic-400 cursor-pointer'
                            : 'border-mechanic-600 bg-mechanic-900/50 cursor-not-allowed opacity-50'
                }
      `}
        >
            {/* Icono central */}
            <div className={`
        w-20 h-20 rounded-2xl flex items-center justify-center mb-4
        transition-[background-color,transform] duration-300
        ${isProcessing
                    ? 'bg-accent-orange/20 animate-pulse'
                    : isDragOver
                        ? 'bg-accent-orange/30 scale-110'
                        : 'bg-mechanic-700/50'
                }
      `}>
                {isProcessing ? (
                    <svg className="w-10 h-10 text-accent-orange animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <span className="text-4xl">
                        {isDragOver ? '📥' : '🎬'}
                    </span>
                )}
            </div>

            {/* Texto principal */}
            <h2 className="text-xl font-bold text-white mb-2">
                {isProcessing
                    ? 'Procesando...'
                    : isDragOver
                        ? '¡Suelta aquí!'
                        : hasClient
                            ? 'Arrastra tu video aquí'
                            : 'Selecciona un cliente primero'
                }
            </h2>

            <p className="text-mechanic-400 text-center max-w-md text-sm">
                {isProcessing
                    ? 'Comprimiendo video con FFmpeg...'
                    : hasClient
                        ? 'Soporta MP4, MOV, AVI, MKV, WEBM y más'
                        : 'Crea un nuevo cliente o selecciona uno existente'
                }
            </p>

            {/* Efecto de borde animado cuando está activo */}
            {isDragOver && (
                <div className="absolute inset-0 rounded-2xl border-4 border-accent-orange 
                        animate-pulse pointer-events-none" />
            )}
        </div>
    )
}

export default DropZone
