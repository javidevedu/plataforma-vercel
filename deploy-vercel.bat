@echo off
echo 🚀 Desplegando AppSemillero a Vercel...
echo.

REM Verificar que Vercel CLI esté instalado
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI no está instalado. Instalando...
    npm install -g vercel
)

REM Verificar que estemos logueados
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Iniciando sesión en Vercel...
    vercel login
)

echo 📦 Instalando dependencias...
call npm run install-all

echo 🏗️ Construyendo proyecto...
call npm run build

echo 🚀 Desplegando a Vercel...
call vercel --prod

echo.
echo ✅ ¡Despliegue completado!
echo 📝 No olvides:
echo    1. Configurar POSTGRES_URL en las variables de entorno
echo    2. Visitar /api/init-db para inicializar la base de datos
echo    3. Probar la aplicación
echo.

pause
