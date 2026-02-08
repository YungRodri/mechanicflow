import React, { useState, useRef, useEffect } from 'react'

function Sidebar({ clients, selectedClient, onSelectClient, onCreateClient, onClientAction }) {
    const [isCreating, setIsCreating] = useState(false)
    const [newClientName, setNewClientName] = useState('')
    const [contextMenu, setContextMenu] = useState(null)
    const [renameModal, setRenameModal] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const contextMenuRef = useRef(null)

    // Cerrar menú contextual al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleCreate = () => {
        if (newClientName.trim()) {
            onCreateClient(newClientName.trim())
            setNewClientName('')
            setIsCreating(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleCreate()
        if (e.key === 'Escape') {
            setIsCreating(false)
            setNewClientName('')
        }
    }

    const handleContextMenu = (e, client) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            client
        })
    }

    const handleMenuAction = async (action) => {
        const client = contextMenu.client
        setContextMenu(null)

        switch (action) {
            case 'rename':
                setRenameModal({ client, newName: client.name })
                break
            case 'duplicate':
                if (onClientAction) {
                    onClientAction('duplicate', client)
                }
                break
            case 'delete':
                setDeleteConfirm(client)
                break
            case 'openFolder':
                if (onClientAction) {
                    onClientAction('openFolder', client)
                }
                break
            case 'details':
                if (onClientAction) {
                    onClientAction('details', client)
                }
                break
        }
    }

    const handleRename = async () => {
        if (renameModal && renameModal.newName.trim() && renameModal.newName !== renameModal.client.name) {
            if (onClientAction) {
                await onClientAction('rename', renameModal.client, renameModal.newName.trim())
            }
        }
        setRenameModal(null)
    }

    const handleDelete = async () => {
        if (deleteConfirm && onClientAction) {
            await onClientAction('delete', deleteConfirm)
        }
        setDeleteConfirm(null)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <aside className="w-72 bg-mechanic-800 border-r border-mechanic-600 flex flex-col relative">
            {/* Header */}
            <div className="p-5 border-b border-mechanic-600">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-orange-600 
                          flex items-center justify-center text-xl">
                        🔧
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg">MechanicFlow</h1>
                        <p className="text-mechanic-300 text-xs">Gestión de Evidencia</p>
                    </div>
                </div>
            </div>

            {/* Nuevo Cliente */}
            <div className="p-4 border-b border-mechanic-600">
                {isCreating ? (
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nombre del cliente..."
                            autoFocus
                            className="w-full px-4 py-3 bg-mechanic-700 border border-mechanic-500 
                         rounded-xl text-white placeholder-mechanic-400
                         focus:outline-none focus:border-accent-orange transition-colors"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-2 bg-accent-green text-white rounded-lg 
                           font-medium hover:opacity-90 transition-opacity"
                            >
                                Crear
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreating(false)
                                    setNewClientName('')
                                }}
                                className="flex-1 py-2 bg-mechanic-600 text-mechanic-200 rounded-lg
                           font-medium hover:bg-mechanic-500 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-3 px-4 border-2 border-dashed border-mechanic-500 
                       rounded-xl text-mechanic-300 hover:border-accent-orange 
                       hover:text-accent-orange transition-colors flex items-center 
                       justify-center gap-2 font-medium"
                    >
                        <span className="text-xl">+</span>
                        Nuevo Cliente
                    </button>
                )}
            </div>

            {/* Lista de clientes */}
            <div className="flex-1 overflow-y-auto p-3">
                <p className="text-mechanic-400 text-xs uppercase tracking-wider px-2 mb-3">
                    Trabajos Activos ({clients.length})
                </p>

                <div className="space-y-2">
                    {clients.map((client) => (
                        <button
                            key={client.id}
                            onClick={() => onSelectClient(client)}
                            onContextMenu={(e) => handleContextMenu(e, client)}
                            className={`
                w-full p-4 rounded-xl text-left transition-colors
                ${selectedClient?.id === client.id
                                    ? 'bg-gradient-to-r from-accent-orange/20 to-transparent border-l-4 border-accent-orange'
                                    : 'bg-mechanic-700/50 hover:bg-mechanic-700 border-l-4 border-transparent'
                                }
              `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">
                                        {client.name}
                                    </h3>
                                    <p className="text-mechanic-400 text-sm mt-1">
                                        {formatDate(client.createdAt) || client.date}
                                    </p>
                                </div>
                                {client.processedCount > 0 && (
                                    <span className="bg-accent-blue/20 text-accent-blue text-xs 
                                   px-2 py-1 rounded-lg font-medium">
                                        {client.processedCount}
                                    </span>
                                )}
                            </div>

                            {/* Estado mini */}
                            <div className="flex gap-1 mt-3">
                                {['recepcion', 'desarme', 'reparacion', 'listo'].map((step) => (
                                    <div
                                        key={step}
                                        className={`
                      h-1.5 flex-1 rounded-full
                      ${client.status?.[step] ? 'bg-accent-green' : 'bg-mechanic-600'}
                    `}
                                    />
                                ))}
                            </div>
                        </button>
                    ))}

                    {clients.length === 0 && (
                        <div className="text-center py-8 text-mechanic-400">
                            <p className="text-4xl mb-3">📁</p>
                            <p>No hay clientes</p>
                            <p className="text-sm mt-1">Crea uno nuevo para comenzar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-mechanic-600 text-center">
                <p className="text-mechanic-500 text-xs">
                    v1.0.0 · Local First
                </p>
            </div>

            {/* Menú Contextual */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed bg-mechanic-700 border border-mechanic-500 rounded-xl 
                       shadow-2xl py-2 z-50 min-w-48 animate-fadeIn"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <div className="px-4 py-2 border-b border-mechanic-600 mb-1">
                        <p className="text-white font-medium truncate">{contextMenu.client.name}</p>
                        <p className="text-mechanic-400 text-xs">{contextMenu.client.date}</p>
                    </div>
                    <button
                        onClick={() => handleMenuAction('details')}
                        className="w-full px-4 py-2 text-left text-mechanic-200 hover:bg-mechanic-600 
                           flex items-center gap-3 transition-colors"
                    >
                        <span>ℹ️</span> Ver detalles
                    </button>
                    <button
                        onClick={() => handleMenuAction('rename')}
                        className="w-full px-4 py-2 text-left text-mechanic-200 hover:bg-mechanic-600 
                           flex items-center gap-3 transition-colors"
                    >
                        <span>📝</span> Renombrar
                    </button>
                    <button
                        onClick={() => handleMenuAction('duplicate')}
                        className="w-full px-4 py-2 text-left text-mechanic-200 hover:bg-mechanic-600 
                           flex items-center gap-3 transition-colors"
                    >
                        <span>📋</span> Duplicar
                    </button>
                    <button
                        onClick={() => handleMenuAction('openFolder')}
                        className="w-full px-4 py-2 text-left text-mechanic-200 hover:bg-mechanic-600 
                           flex items-center gap-3 transition-colors"
                    >
                        <span>📁</span> Abrir carpeta
                    </button>
                    <div className="border-t border-mechanic-600 mt-1 pt-1">
                        <button
                            onClick={() => handleMenuAction('delete')}
                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 
                               flex items-center gap-3 transition-colors"
                        >
                            <span>🗑️</span> Eliminar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Renombrar */}
            {renameModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-mechanic-800 rounded-2xl p-6 w-96 shadow-2xl border border-mechanic-600">
                        <h3 className="text-xl font-bold text-white mb-4">Renombrar Cliente</h3>
                        <input
                            type="text"
                            value={renameModal.newName}
                            onChange={(e) => setRenameModal({ ...renameModal, newName: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename()
                                if (e.key === 'Escape') setRenameModal(null)
                            }}
                            autoFocus
                            className="w-full px-4 py-3 bg-mechanic-700 border border-mechanic-500 
                         rounded-xl text-white focus:outline-none focus:border-accent-orange"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleRename}
                                className="flex-1 py-3 bg-accent-orange text-white rounded-xl font-medium 
                           hover:opacity-90 transition-opacity"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => setRenameModal(null)}
                                className="flex-1 py-3 bg-mechanic-600 text-mechanic-200 rounded-xl 
                           font-medium hover:bg-mechanic-500 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-mechanic-800 rounded-2xl p-6 w-96 shadow-2xl border border-mechanic-600">
                        <h3 className="text-xl font-bold text-white mb-2">¿Eliminar cliente?</h3>
                        <p className="text-mechanic-300 mb-4">
                            <strong className="text-white">{deleteConfirm.name}</strong> será movido a la papelera.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium 
                           hover:bg-red-600 transition-colors"
                            >
                                Eliminar
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 bg-mechanic-600 text-mechanic-200 rounded-xl 
                           font-medium hover:bg-mechanic-500 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}

export default Sidebar
