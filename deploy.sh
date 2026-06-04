#!/bin/bash
set -e

cd /home/ubuntu/chambaya

echo "📦 Instalando dependencias del backend..."
cd backend
npm install --production
cd ..

echo "🔨 Construyendo frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🔄 Reiniciando aplicación..."
pm2 restart chambaya

echo "✅ Despliegue completado"
