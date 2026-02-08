import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DropZone from './components/DropZone'
import ModeModal from './components/ModeModal'
import ProgressBar from './components/ProgressBar'
import StatusPanel from './components/StatusPanel'
import Toolbar from './components/Toolbar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
import SettingsModal from './components/SettingsModal'

function App() {
    const [clients, setClients] = useState([])
    const [selectedClient, setSelectedClient] = useState(null)
    const [showModeModal, setShowModeModal] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')
    const [notification, setNotification] = useState(null)
    const [detailsModal, setDetailsModal] = useState(null)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [showSettings, setShowSettings] = useState(false)
    const [isStatusCollapsed, setIsStatusCollapsed] = useState(false)
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('mechanicflow-settings')
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            autoOpenZipFolder: true,
            showNotifications: true,
            outputFolder: null
        }
    })

    // Aplicar tema
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme)
    }, [settings.theme])

    // Persistir configuraciones
    useEffect(() => {
        localStorage.setItem('mechanicflow-settings', JSON.stringify(settings))
    }, [settings])

    // Cargar clientes al iniciar
    useEffect(() => {
        loadClients()
    }, [])

    // Suscribirse a eventos de progreso
    useEffect(() => {
        const unsubFFmpeg = window.api.onProgresoFFmpeg((prog) => {
            setProgress(prog.percent)
            setProgressMessage(`Comprimiendo... ${prog.percent}%`)
        })

        const unsubZip = window.api.onProgresoZip((prog) => {
            setProgress(prog.percent)
            setProgressMessage(`Generando ZIP... ${prog.percent}%`)
        })

        return () => {
            unsubFFmpeg()
            unsubZip()
        }
    }, [])

    const loadClients = async () => {
        const result = await window.api.obtenerClientes()
        if (result.success) {
            setClients(result.data)
            // Actualizar cliente seleccionado si existe
            if (selectedClient) {
                const updated = result.data.find(c => c.id === selectedClient.id)
                if (updated) {
                    setSelectedClient(updated)
                } else {
                    setSelectedClient(result.data[0] || null)
                }
            } else if (result.data.length > 0) {
                setSelectedClient(result.data[0])
            }
        }
    }

    const handleCreateClient = async (name) => {
        const result = await window.api.crearCliente(name)
        if (result.success) {
            showNotification('Cliente creado exitosamente', 'success')
            loadClients()
            setSelectedClient(result.data)
        } else {
            showNotification('Error al crear cliente: ' + result.error, 'error')
        }
    }

    const handleFileDrop = (filePath) => {
        if (!selectedClient) {
            showNotification('Selecciona un cliente primero', 'warning')
            return
        }
        setPendingFile(filePath)
        setShowModeModal(true)
    }

    const handleModeSelect = async (mode) => {
        setShowModeModal(false)
        if (!pendingFile || !selectedClient) return

        setIsProcessing(true)
        setProgress(0)
        setProgressMessage('Iniciando compresión...')

        try {
            const result = await window.api.comprimirVideo(pendingFile, mode, selectedClient.id)

            if (result.success) {
                showNotification(
                    `Video comprimido! Ahorro: ${result.data.savedPercent}%`,
                    'success'
                )
                loadClients()
            } else {
                showNotification('Error: ' + result.error, 'error')
            }
        } catch (error) {
            showNotification('Error al comprimir: ' + error.message, 'error')
        }

        setIsProcessing(false)
        setProgress(0)
        setPendingFile(null)
    }

    const handleGenerateZip = async () => {
        if (!selectedClient) return

        setIsProcessing(true)
        setProgress(0)
        setProgressMessage('Generando ZIP...')

        try {
            const result = await window.api.generarZip(selectedClient.id)
            if (result.success) {
                showNotification(`ZIP generado: ${result.data.path}`, 'success')
                // Abrir carpeta solo si está habilitado en configuraciones
                if (settings.autoOpenZipFolder && window.api.abrirCarpeta) {
                    window.api.abrirCarpeta(result.data.path)
                }
            } else {
                showNotification('Error: ' + result.error, 'error')
            }
        } catch (error) {
            showNotification('Error al generar ZIP: ' + error.message, 'error')
        }

        setIsProcessing(false)
        setProgress(0)
    }

    const handleStatusUpdate = async (status) => {
        if (!selectedClient) return

        const result = await window.api.actualizarEstado(selectedClient.id, status)
        if (result.success) {
            loadClients()
        }
    }

    // Manejar acciones del menú contextual
    const handleClientAction = async (action, client, extraData) => {
        switch (action) {
            case 'rename':
                const renameResult = await window.api.renombrarCliente(client.id, extraData)
                if (renameResult.success) {
                    showNotification('Cliente renombrado', 'success')
                    loadClients()
                } else {
                    showNotification('Error: ' + renameResult.error, 'error')
                }
                break

            case 'duplicate':
                const dupResult = await window.api.duplicarCliente(client.id)
                if (dupResult.success) {
                    showNotification('Cliente duplicado', 'success')
                    loadClients()
                } else {
                    showNotification('Error: ' + dupResult.error, 'error')
                }
                break

            case 'delete':
                const delResult = await window.api.eliminarCliente(client.id)
                if (delResult.success) {
                    showNotification('Cliente movido a papelera', 'success')
                    loadClients()
                } else {
                    showNotification('Error: ' + delResult.error, 'error')
                }
                break

            case 'openFolder':
                if (client.path) {
                    window.api.abrirCarpeta(client.path)
                }
                break

            case 'details':
                const detailsResult = await window.api.obtenerDetallesCliente(client.id)
                if (detailsResult.success) {
                    setDetailsModal(detailsResult.data)
                }
                break
        }
    }

    // Manejo de Tareas
    const handleSaveTask = async (taskData) => {
        if (!selectedClient) return

        let result
        if (editingTask) {
            result = await window.api.actualizarTarea(selectedClient.id, editingTask.id, taskData)
            setNotification({ message: result.success ? 'Tarea actualizada' : 'Error al actualizar', type: result.success ? 'success' : 'error' })
        } else {
            result = await window.api.agregarTarea(selectedClient.id, taskData)
            setNotification({ message: result.success ? 'Tarea creada' : 'Error al crear', type: result.success ? 'success' : 'error' })
        }

        if (result.success) {
            loadClients()
        }
        setEditingTask(null)
    }

    const handleDeleteTask = async (taskId) => {
        if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return

        const result = await window.api.eliminarTarea(selectedClient.id, taskId)
        if (result.success) {
            showNotification('Tarea eliminada', 'success')
            loadClients()
        } else {
            showNotification('Error al eliminar tarea', 'error')
        }
    }

    const handleToggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed'
        const result = await window.api.actualizarTarea(selectedClient.id, task.id, { status: newStatus })
        if (result.success) {
            loadClients()
        }
    }

    // Toolbar: Seleccionar y comprimir video
    const handleToolbarCompressVideo = async () => {
        if (!selectedClient) {
            showNotification('Selecciona un cliente primero', 'warning')
            return
        }

        const result = await window.api.seleccionarArchivo({
            filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] }]
        })

        if (result.success && result.data) {
            setPendingFile(result.data)
            setShowModeModal(true)
        }
    }

    // Toolbar: Agregar foto
    const handleToolbarAddPhoto = async () => {
        if (!selectedClient) {
            showNotification('Selecciona un cliente primero', 'warning')
            return
        }

        const result = await window.api.seleccionarArchivo({
            filters: [{ name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
        })

        if (result.success && result.data) {
            showNotification('Foto agregada al cliente', 'success')
            loadClients()
        }
    }

    // Toolbar: Abrir carpeta
    const handleToolbarOpenFolder = () => {
        if (selectedClient?.path) {
            window.api.abrirCarpeta(selectedClient.path)
        }
    }

    // Toolbar: Tareas
    const handleToolbarAddTask = () => {
        setEditingTask(null)
        setShowTaskModal(true)
    }

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 4000)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('es-CL')
    }

    return (
        <div className="flex h-screen bg-mechanic-900">
            {/* Sidebar */}
            <Sidebar
                clients={clients}
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
                onCreateClient={handleCreateClient}
                onClientAction={handleClientAction}
            />

            {/* Área principal */}
            <main className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {selectedClient ? selectedClient.name : 'MechanicFlow'}
                        </h1>
                        {selectedClient && (
                            <p className="text-mechanic-300 text-sm mt-1">
                                {selectedClient.processedCount || 0} archivos procesados · {selectedClient.date}
                            </p>
                        )}
                    </div>

                    {/* Botón de Configuraciones */}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2.5 rounded-lg bg-mechanic-700 hover:bg-mechanic-600 
                                 transition-all duration-300 group"
                        title="Configuraciones"
                    >
                        <svg
                            className="w-5 h-5 text-mechanic-300 group-hover:text-white group-hover:rotate-90 transition-all duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </button>
                </header>

                {/* Toolbar de herramientas */}
                <Toolbar
                    onCompressVideo={handleToolbarCompressVideo}
                    onAddPhoto={handleToolbarAddPhoto}
                    onGenerateZip={handleGenerateZip}
                    onOpenFolder={handleToolbarOpenFolder}
                    onAddTask={handleToolbarAddTask}
                    isProcessing={isProcessing}
                    hasClient={!!selectedClient}
                />

                {/* Contenido principal */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {selectedClient ? (
                        <div className="flex gap-6 h-full">
                            {/* Columna Izquierda: DropZone y Tareas */}
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                <div className="flex-none">
                                    <DropZone
                                        onFileDrop={handleFileDrop}
                                        isProcessing={isProcessing}
                                        hasClient={!!selectedClient}
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2">
                                    <h3 className="text-lg font-bold text-white mb-3 sticky top-0 bg-mechanic-900 py-2 z-10 flex justify-between items-center">
                                        <span>📋 Tareas Pendientes</span>
                                        <button
                                            onClick={() => { setEditingTask(null); setShowTaskModal(true) }}
                                            className="text-xs bg-accent-blue text-white hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity font-medium shadow-lg"
                                        >
                                            + Nueva
                                        </button>
                                    </h3>
                                    <TaskList
                                        tasks={selectedClient.tasks || []}
                                        onEdit={(task) => { setEditingTask(task); setShowTaskModal(true) }}
                                        onDelete={handleDeleteTask}
                                        onToggleStatus={handleToggleTaskStatus}
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha: Panel de Estado */}
                            <div className={`flex flex-col gap-4 flex-none overflow-y-auto transition-[width] duration-300 ${isStatusCollapsed ? 'w-14' : 'w-56'
                                }`}>
                                <StatusPanel
                                    status={selectedClient.status || {}}
                                    onStatusChange={handleStatusUpdate}
                                    isCollapsed={isStatusCollapsed}
                                    onToggleCollapse={() => setIsStatusCollapsed(!isStatusCollapsed)}
                                />
                            </div>
                        </div>
                    ) : (
                        <DropZone
                            onFileDrop={handleFileDrop}
                            isProcessing={isProcessing}
                            hasClient={false}
                        />
                    )}
                </div>

                {/* Barra de progreso */}
                {isProcessing && (
                    <ProgressBar
                        progress={progress}
                        message={progressMessage}
                    />
                )}
            </main>

            {/* Modal de Tareas */}
            {showTaskModal && (
                <TaskModal
                    onClose={() => { setShowTaskModal(false); setEditingTask(null) }}
                    onSave={handleSaveTask}
                    initialData={editingTask}
                />
            )}

            {/* Modal de selección de modo */}
            {showModeModal && (
                <ModeModal
                    onSelect={handleModeSelect}
                    onClose={() => {
                        setShowModeModal(false)
                        setPendingFile(null)
                    }}
                />
            )}

            {/* Modal de detalles del cliente */}
            {detailsModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-mechanic-800 rounded-2xl p-6 w-[480px] shadow-2xl border border-mechanic-600">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>ℹ️</span> Detalles del Cliente
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-mechanic-600">
                                <span className="text-mechanic-400">Nombre</span>
                                <span className="text-white font-medium">{detailsModal.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-mechanic-600">
                                <span className="text-mechanic-400">Creado</span>
                                <span className="text-white">{formatDate(detailsModal.createdAt)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-mechanic-600">
                                <span className="text-mechanic-400">Última modificación</span>
                                <span className="text-white">{formatDate(detailsModal.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-mechanic-600">
                                <span className="text-mechanic-400">Tamaño total</span>
                                <span className="text-white font-medium">{detailsModal.totalSizeFormatted}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-mechanic-600">
                                <span className="text-mechanic-400">Archivos</span>
                                <span className="text-white">{detailsModal.fileCount}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="text-center p-3 bg-mechanic-700 rounded-xl">
                                    <p className="text-2xl font-bold text-accent-blue">{detailsModal.originales}</p>
                                    <p className="text-mechanic-400 text-sm">Originales</p>
                                </div>
                                <div className="text-center p-3 bg-mechanic-700 rounded-xl">
                                    <p className="text-2xl font-bold text-accent-green">{detailsModal.procesados}</p>
                                    <p className="text-mechanic-400 text-sm">Procesados</p>
                                </div>
                                <div className="text-center p-3 bg-mechanic-700 rounded-xl">
                                    <p className="text-2xl font-bold text-accent-orange">{detailsModal.fotos}</p>
                                    <p className="text-mechanic-400 text-sm">Fotos</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    window.api.abrirCarpeta(detailsModal.path)
                                }}
                                className="flex-1 py-3 bg-accent-blue text-white rounded-xl font-medium 
                           hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                📁 Abrir Carpeta
                            </button>
                            <button
                                onClick={() => setDetailsModal(null)}
                                className="flex-1 py-3 bg-mechanic-600 text-mechanic-200 rounded-xl 
                           font-medium hover:bg-mechanic-500 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Configuraciones */}
            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    settings={settings}
                    onSettingsChange={setSettings}
                />
            )}

            {/* Notificaciones */}
            {settings.showNotifications && notification && (
                <div className={`
          fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl
          animate-slideUp z-50 max-w-md
          ${notification.type === 'success' ? 'bg-accent-green/90 text-white' : ''}
          ${notification.type === 'error' ? 'bg-red-500/90 text-white' : ''}
          ${notification.type === 'warning' ? 'bg-accent-yellow/90 text-black' : ''}
          ${notification.type === 'info' ? 'bg-accent-blue/90 text-white' : ''}
        `}>
                    {notification.message}
                </div>
            )}
        </div>
    )
}

export default App
