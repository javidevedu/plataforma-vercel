#!/bin/bash

echo "🚀 Desplegando AppSemillero a Vercel..."
echo

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

# Verificar que estemos logueados
if ! vercel whoami &> /dev/null; then
    echo "🔐 Iniciando sesión en Vercel..."
    vercel login
fi

echo "📦 Instalando dependencias..."
npm run install-all

echo "🏗️ Construyendo proyecto..."
npm run build

echo "🚀 Desplegando a Vercel..."
vercel --prod

echo
echo "✅ ¡Despliegue completado!"
echo "📝 No olvides:"
echo "   1. Configurar POSTGRES_URL en las variables de entorno"
echo "   2. Visitar /api/init-db para inicializar la base de datos"
echo "   3. Probar la aplicación"
echo
