import React from 'react'

const MODES = [
    {
        id: 'DETALLE',
        icon: '🔍',
        title: 'Detalle',
        description: 'Máxima calidad para tuercas, roscas y fisuras',
        color: 'from-blue-500 to-blue-600',
        crf: 20
    },
    {
        id: 'GENERAL',
        icon: '📷',
        title: 'General',
        description: 'Calidad media para vistas generales (1080p)',
        color: 'from-green-500 to-green-600',
        crf: 24
    },
    {
        id: 'RAPIDO',
        icon: '⚡',
        title: 'Rápido',
        description: 'Compresión máxima para reportes largos (720p)',
        color: 'from-orange-500 to-orange-600',
        crf: 28
    }
]

function ModeModal({ onSelect, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center 
                 justify-center z-50 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-mechanic-800 rounded-3xl p-8 max-w-2xl w-full mx-6 
                   shadow-2xl animate-slideUp border border-mechanic-600"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        ¿Qué tipo de video es?
                    </h2>
                    <p className="text-mechanic-400">
                        Selecciona el modo de compresión adecuado
                    </p>
                </div>

                {/* Opciones */}
                <div className="grid gap-4">
                    {MODES.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => onSelect(mode.id)}
                            className={`
                relative p-6 rounded-2xl text-left transition-all duration-200
                bg-gradient-to-r ${mode.color} hover:scale-[1.02] hover:shadow-lg
                group overflow-hidden
              `}
                        >
                            {/* Fondo decorativo */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl 
                              opacity-20 group-hover:opacity-30 transition-opacity">
                                {mode.icon}
                            </div>

                            <div className="relative flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center 
                                justify-center text-3xl shrink-0">
                                    {mode.icon}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {mode.title}
                                    </h3>
                                    <p className="text-white/80">
                                        {mode.description}
                                    </p>
                                </div>

                                <div className="ml-auto shrink-0">
                                    <span className="bg-white/20 px-3 py-1 rounded-lg text-white text-sm 
                                   font-mono">
                                        CRF {mode.crf}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Botón cancelar */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 py-4 rounded-xl bg-mechanic-700 text-mechanic-300
                     hover:bg-mechanic-600 transition-colors font-medium"
                >
                    Cancelar
                </button>
            </div>
        </div>
    )
}

export default ModeModal
