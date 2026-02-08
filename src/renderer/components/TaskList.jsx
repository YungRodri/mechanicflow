import React, { useState, useEffect, useCallback } from 'react'

function TaskList({ tasks, onEdit, onDelete, onToggleStatus }) {
    const [contextMenu, setContextMenu] = useState(null)

    const handleCloseMenu = useCallback(() => {
        setContextMenu(null)
    }, [])

    // Cerrar menú al hacer click fuera - DEBE estar antes de cualquier return condicional
    useEffect(() => {
        if (contextMenu) {
            document.addEventListener('click', handleCloseMenu)
            return () => document.removeEventListener('click', handleCloseMenu)
        }
    }, [contextMenu, handleCloseMenu])

    // Early return DESPUÉS de todos los hooks
    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-8 text-mechanic-500 border-2 border-dashed border-mechanic-700 rounded-xl">
                <p>No hay tareas pendientes</p>
                <p className="text-sm">Agrega una tarea nueva para comenzar</p>
            </div>
        )
    }

    const priorityColor = (priority) => {
        switch (priority) {
            case 'Alta': return 'text-red-400 bg-red-400/10'
            case 'Media': return 'text-yellow-400 bg-yellow-400/10'
            case 'Baja': return 'text-green-400 bg-green-400/10'
            default: return 'text-mechanic-400 bg-mechanic-400/10'
        }
    }

    const statusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅'
            case 'in_progress': return '⏳'
            default: return '⭕'
        }
    }

    const handleContextMenu = (e, task) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            task
        })
    }

    const handleMenuAction = (action, task) => {
        switch (action) {
            case 'edit':
                onEdit(task)
                break
            case 'delete':
                onDelete(task.id)
                break
            case 'toggle':
                onToggleStatus(task)
                break
        }
        handleCloseMenu()
    }

    return (
        <>
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onContextMenu={(e) => handleContextMenu(e, task)}
                        className="bg-mechanic-800 border border-mechanic-600 rounded-xl p-4 
                                 hover:border-accent-blue/50 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                            <button
                                onClick={() => onToggleStatus(task)}
                                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                    ? 'bg-accent-green border-accent-green text-white'
                                    : 'border-mechanic-500 hover:border-accent-green'
                                    }`}
                            >
                                {task.status === 'completed' && '✓'}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-medium truncate ${task.status === 'completed' ? 'text-mechanic-500 line-through' : 'text-white'
                                        }`}>
                                        {task.title}
                                    </h4>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(task)}
                                            className="text-mechanic-400 hover:text-white p-1"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => onDelete(task.id)}
                                            className="text-mechanic-400 hover:text-red-400 p-1"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {task.description && (
                                    <p className="text-mechanic-400 text-sm mb-3 line-clamp-2">
                                        {task.description}
                                    </p>
                                )}

                                <div className="flex gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded-md font-medium ${priorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    {task.status !== 'pending' && (
                                        <span className="px-2 py-1 rounded-md bg-mechanic-700 text-mechanic-300 flex items-center gap-1">
                                            {statusIcon(task.status)}
                                            {task.status === 'in_progress' ? 'En Progreso' : 'Completado'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Menú Contextual */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-mechanic-800 border border-mechanic-600 rounded-lg shadow-2xl py-2 min-w-[180px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <button
                        onClick={() => handleMenuAction('edit', contextMenu.task)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-mechanic-700 transition-colors flex items-center gap-2"
                    >
                        ✏️ Editar tarea
                    </button>
                    <button
                        onClick={() => handleMenuAction('toggle', contextMenu.task)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-mechanic-700 transition-colors flex items-center gap-2"
                    >
                        {contextMenu.task.status === 'completed' ? '⭕ Marcar pendiente' : '✅ Marcar completada'}
                    </button>
                    <div className="border-t border-mechanic-600 my-1"></div>
                    <button
                        onClick={() => handleMenuAction('delete', contextMenu.task)}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-mechanic-700 transition-colors flex items-center gap-2"
                    >
                        🗑️ Eliminar tarea
                    </button>
                </div>
            )}
        </>
    )
}

export default TaskList
