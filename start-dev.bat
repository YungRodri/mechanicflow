@echo off
cd /d "%~dp0"
set NODE_ENV=development

REM Agregar Node.js local al PATH
set PATH=%~dp0node-v20.11.0-win-x64;%PATH%

REM Limpiar procesos anteriores (opcional, evita errores de puerto)
taskkill /F /IM electron.exe >nul 2>&1

REM Iniciar Vite en segundo plano
echo Iniciando servidor Vite...
start /B cmd /c "npm run dev:vite"

REM Esperar a que Vite este listo
echo Esperando a Vite (7 segundos)...
timeout /t 7 /nobreak > nul

REM Iniciar Electron usando el ejecutable directo
echo Iniciando Electron...
.\node_modules\electron\dist\electron.exe .

echo.
echo Si Electron se cerro inesperadamente, revisa los errores arriba.
pause
