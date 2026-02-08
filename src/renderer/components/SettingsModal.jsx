import React from 'react'
import ThemeToggle from './ThemeToggle'

export default function SettingsModal({ onClose, settings, onSettingsChange }) {
    const handleChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value })
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-mechanic-800 rounded-2xl w-[580px] max-h-[80vh] overflow-y-auto shadow-2xl border border-mechanic-600 animate-slideUp">
                {/* Header */}
                <div className="sticky top-0 bg-mechanic-800 border-b border-mechanic-600 p-6 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            ⚙️ Configuraciones
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-mechanic-700 hover:bg-mechanic-600 transition-colors"
                        >
                            <svg className="w-5 h-5 text-mechanic-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Tema */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            🎨 Apariencia
                        </h3>
                        <div className="p-4 bg-mechanic-700 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Tema de la aplicación</p>
                                    <p className="text-mechanic-300 text-sm mt-0.5">
                                        {settings.theme === 'dark' ? 'Oscuro' : 'Claro'}
                                    </p>
                                </div>
                                <ThemeToggle theme={settings.theme} onThemeChange={(theme) => handleChange('theme', theme)} />
                            </div>
                        </div>
                    </section>

                    {/* Carpeta de salida */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            📁 Rutas
                        </h3>
                        <div className="p-4 bg-mechanic-700 rounded-xl space-y-3">
                            <div>
                                <label className="text-white font-medium block mb-2">
                                    Carpeta de videos procesados
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={settings.outputFolder || 'Default (carpeta del cliente)'}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-mechanic-600 text-mechanic-100 rounded-lg 
                                                 border border-mechanic-500 focus:outline-none focus:border-accent-blue"
                                    />
                                    <button
                                        onClick={() => {
                                            // TODO: Implementar selector de carpeta
                                            alert('Función de selector de carpeta pendiente')
                                        }}
                                        className="px-4 py-2 bg-accent-blue text-white rounded-lg 
                                                 hover:opacity-90 transition-opacity whitespace-nowrap"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                                <p className="text-mechanic-300 text-xs mt-1.5">
                                    Por defecto, los videos se guardan en la carpeta del cliente
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Comportamiento */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            🔔 Comportamiento
                        </h3>
                        <div className="p-4 bg-mechanic-700 rounded-xl space-y-4">
                            {/* Auto-abrir carpeta ZIP */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-white font-medium">Abrir carpeta al generar ZIP</p>
                                    <p className="text-mechanic-300 text-sm mt-0.5">
                                        Abre automáticamente la carpeta del ZIP generado
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoOpenZipFolder ?? true}
                                        onChange={(e) => handleChange('autoOpenZipFolder', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-mechanic-600 peer-focus:outline-none rounded-full peer 
                                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                                                  peer-checked:bg-accent-green"></div>
                                </label>
                            </div>

                            {/* Mostrar notificaciones */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-white font-medium">Mostrar notificaciones</p>
                                    <p className="text-mechanic-300 text-sm mt-0.5">
                                        Notificaciones de éxito y error en las operaciones
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showNotifications ?? true}
                                        onChange={(e) => handleChange('showNotifications', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-mechanic-600 peer-focus:outline-none rounded-full peer 
                                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                                                  peer-checked:bg-accent-green"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Info */}
                    <section className="p-4 bg-mechanic-700/50 rounded-xl border border-mechanic-600">
                        <p className="text-mechanic-300 text-sm text-center">
                            MechanicFlow v1.1 · Los cambios se guardan automáticamente
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-mechanic-800 border-t border-mechanic-600 p-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-accent-blue text-white rounded-xl font-medium 
                                 hover:opacity-90 transition-opacity"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
