import React from 'react'

const STEPS = [
    { id: 'recepcion', label: 'Recepción', icon: '📥' },
    { id: 'desarme', label: 'Desarme', icon: '🔧' },
    { id: 'reparacion', label: 'Reparación', icon: '⚙️' },
    { id: 'listo', label: 'Listo', icon: '✅' }
]

function StatusPanel({ status = {}, onStatusChange, isCollapsed, onToggleCollapse }) {
    const handleToggle = (stepId) => {
        onStatusChange({ [stepId]: !status?.[stepId] })
    }

    const completedCount = STEPS.filter(step => status?.[step.id]).length
    const progressPercent = Math.round((completedCount / STEPS.length) * 100)

    return (
        <div className={`glass rounded-xl transition-[width] duration-300 ${isCollapsed ? 'w-12' : 'w-52'}`}>
            {isCollapsed ? (
                // Vista colapsada - Solo barra vertical con progreso
                <div className="p-2 flex flex-col items-center gap-3 h-full">
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-lg bg-mechanic-600 hover:bg-mechanic-500 transition-colors"
                        title="Expandir panel"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Progreso vertical */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <span className="text-white font-bold text-xs transform -rotate-90 whitespace-nowrap">
                            {progressPercent}%
                        </span>

                        {/* Indicadores verticales de pasos */}
                        <div className="flex flex-col gap-1">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`w-2 h-2 rounded-full transition-colors ${status?.[step.id] ? 'bg-accent-green' : 'bg-mechanic-600'
                                        }`}
                                    title={step.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // Vista expandida
                <div className="p-3">
                    {/* Header con botón de colapsar */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-white text-sm">Estado</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-mechanic-400 text-xs">
                                {completedCount}/{STEPS.length}
                            </span>
                            <button
                                onClick={onToggleCollapse}
                                className="p-1 rounded hover:bg-mechanic-600 transition-colors"
                                title="Minimizar panel"
                            >
                                <svg className="w-3.5 h-3.5 text-mechanic-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Timeline compacto */}
                    <div className="space-y-2">
                        {STEPS.map((step, index) => {
                            const isCompleted = status?.[step.id]
                            const isPrevCompleted = index === 0 || status?.[STEPS[index - 1].id]

                            return (
                                <div key={step.id} className="flex items-center gap-2">
                                    {/* Botón más pequeño */}
                                    <div className="flex flex-col items-center">
                                        <button
                                            onClick={() => handleToggle(step.id)}
                                            className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs
                    transition-all duration-200 
                    ${isCompleted
                                                    ? 'bg-accent-green text-white shadow-md'
                                                    : isPrevCompleted
                                                        ? 'bg-mechanic-600 hover:bg-mechanic-500 cursor-pointer'
                                                        : 'bg-mechanic-700 opacity-40 cursor-not-allowed'
                                                }
                  `}
                                            disabled={!isPrevCompleted && !isCompleted}
                                        >
                                            {isCompleted ? '✓' : step.icon}
                                        </button>

                                        {/* Línea vertical más corta */}
                                        {index < STEPS.length - 1 && (
                                            <div className={`
                    w-0.5 h-2 mt-1 transition-colors
                    ${isCompleted ? 'bg-accent-green' : 'bg-mechanic-600'}
                  `} />
                                        )}
                                    </div>

                                    {/* Label más compacto */}
                                    <div className="flex-1 min-w-0">
                                        <span className={`
                  text-xs font-medium transition-colors truncate block
                  ${isCompleted ? 'text-white' : 'text-mechanic-400'}
                `}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Barra de progreso más compacta */}
                    <div className="mt-3 pt-3 border-t border-mechanic-600">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-mechanic-400 text-xs">Progreso</span>
                            <span className="text-white font-bold text-xs">
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-mechanic-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent-green to-emerald-400 
                       rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatusPanel
