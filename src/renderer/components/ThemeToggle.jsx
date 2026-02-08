import React from 'react'

export default function ThemeToggle({ theme, onThemeChange }) {
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        onThemeChange(newTheme)
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-mechanic-700 hover:bg-mechanic-600 
                     transition-all duration-300 group relative"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {theme === 'dark' ? (
                // Ícono de Sol (modo claro)
                <svg
                    className="w-5 h-5 text-accent-yellow transition-transform group-hover:rotate-45 duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="4" strokeWidth="2" />
                    <path
                        strokeLinecap="round"
                        strokeWidth="2"
                        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
                    />
                </svg>
            ) : (
                // Ícono de Luna (modo oscuro)
                <svg
                    className="w-5 h-5 text-accent-blue transition-transform group-hover:-rotate-12 duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            )}

            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                           bg-mechanic-800 text-mechanic-100 text-xs px-3 py-1.5 rounded-lg
                           opacity-0 group-hover:opacity-100 transition-opacity
                           pointer-events-none whitespace-nowrap shadow-lg">
                {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </span>
        </button>
    )
}
