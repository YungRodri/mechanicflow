/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/renderer/**/*.{js,jsx,html}"
    ],
    theme: {
        extend: {
            colors: {
                // Colores dinámicos basados en variables CSS
                'mechanic': {
                    900: 'var(--bg-primary)',
                    800: 'var(--bg-secondary)',
                    700: 'var(--bg-tertiary)',
                    600: 'var(--bg-elevated)',
                    500: 'var(--border-primary)',
                    400: 'var(--border-secondary)',
                    300: 'var(--text-tertiary)',
                    200: 'var(--text-secondary)',
                    100: 'var(--text-primary)'
                },
                'accent': {
                    orange: 'var(--accent-orange)',
                    blue: 'var(--accent-blue)',
                    green: 'var(--accent-green)',
                    yellow: 'var(--accent-yellow)'
                }
            },
            fontFamily: {
                'industrial': ['Inter', 'system-ui', 'sans-serif']
            }
        }
    },
    plugins: []
}
