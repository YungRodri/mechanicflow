import React, { useState, useEffect } from 'react'

function TaskModal({ onClose, onSave, initialData }) {
    const [task, setTask] = useState({
        title: '',
        description: '',
        priority: 'Media',
        status: 'pending',
        ...initialData
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (task.title.trim()) {
            onSave(task)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-[#12121a] rounded-2xl p-6 w-[500px] shadow-2xl border border-mechanic-600 animate-slideUp">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {initialData ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
                    </h3>
                    <button onClick={onClose} className="text-mechanic-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-mechanic-400 mb-1">Título de la tarea</label>
                        <input
                            type="text"
                            value={task.title}
                            onChange={(e) => setTask({ ...task, title: e.target.value })}
                            placeholder="Ej: Optimizar meta descriptions..."
                            className="w-full px-4 py-3 bg-mechanic-800 border border-mechanic-600 rounded-xl 
                                     text-white placeholder-mechanic-500 focus:border-accent-blue 
                                     focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-mechanic-400 mb-1">Descripción (opcional)</label>
                        <textarea
                            value={task.description}
                            onChange={(e) => setTask({ ...task, description: e.target.value })}
                            placeholder="Describe los detalles específicos..."
                            rows="3"
                            className="w-full px-4 py-3 bg-mechanic-800 border border-mechanic-600 rounded-xl 
                                     text-white placeholder-mechanic-500 focus:border-accent-blue 
                                     focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-mechanic-400 mb-1">Prioridad</label>
                            <select
                                value={task.priority}
                                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                                className="w-full px-4 py-3 bg-mechanic-800 border border-mechanic-600 rounded-xl 
                                         text-white focus:border-accent-blue focus:outline-none transition-colors appearance-none"
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-mechanic-400 mb-1">Estado</label>
                            <select
                                value={task.status}
                                onChange={(e) => setTask({ ...task, status: e.target.value })}
                                className="w-full px-4 py-3 bg-mechanic-800 border border-mechanic-600 rounded-xl 
                                         text-white focus:border-accent-blue focus:outline-none transition-colors appearance-none"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="in_progress">En Progreso</option>
                                <option value="completed">Completada</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-mechanic-800 text-mechanic-300 rounded-xl font-medium 
                                     hover:bg-mechanic-700 transition-colors border border-mechanic-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-accent-blue text-white rounded-xl font-medium 
                                     hover:opacity-90 transition-opacity shadow-lg"
                        >
                            {initialData ? 'Guardar Cambios' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaskModal
