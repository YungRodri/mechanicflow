import React from 'react'

function ProgressBar({ progress, message }) {
    return (
        <div className="glass rounded-2xl p-5 animate-slideUp">
            <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{message}</span>
                <span className="text-accent-orange font-bold text-lg">{progress}%</span>
            </div>

            {/* Barra de progreso */}
            <div className="h-3 bg-mechanic-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-accent-orange to-orange-500 
                     rounded-full transition-all duration-300 ease-out
                     relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                          via-white/30 to-transparent animate-shimmer" />
                </div>
            </div>

            {/* Info adicional */}
            <div className="flex justify-between mt-3 text-sm text-mechanic-400">
                <span>Procesando con FFmpeg</span>
                <span>
                    {progress < 100 ? 'Por favor espera...' : '¡Completado!'}
                </span>
            </div>

            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
        </div>
    )
}

export default ProgressBar
