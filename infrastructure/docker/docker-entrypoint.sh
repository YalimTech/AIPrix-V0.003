#!/bin/sh

echo "🚀 Starting PrixAgent SaaS Production Server..."

# Inicializar sistema ANTES de cualquier operación
if [ -f "scripts/eliminate-tail-warning.sh" ]; then
  echo "🔧 ELIMINANDO COMPLETAMENTE EL WARNING DE TAIL..."
  chmod +x scripts/eliminate-tail-warning.sh
  ./scripts/eliminate-tail-warning.sh
elif [ -f "scripts/dokploy-logging-fix.sh" ]; then
  echo "🔧 Configurando sistema para eliminar warnings de Dokploy..."
  chmod +x scripts/dokploy-logging-fix.sh
  ./scripts/dokploy-logging-fix.sh
elif [ -f "scripts/disable-tail-warnings.sh" ]; then
  echo "🔧 Configurando sistema para eliminar warnings de tail..."
  chmod +x scripts/disable-tail-warnings.sh
  ./scripts/disable-tail-warnings.sh
elif [ -f "scripts/init-system.sh" ]; then
  echo "🔧 Inicializando sistema..."
  chmod +x scripts/init-system.sh
  ./scripts/init-system.sh
else
  echo "🔧 Configurando límites del sistema manualmente..."
  ulimit -n 65536 2>/dev/null || echo "⚠️ No se pudo configurar ulimit"
  echo 65536 > /proc/sys/fs/file-max 2>/dev/null || echo "⚠️ No se pudo configurar file-max"
  echo 524288 > /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "⚠️ No se pudo configurar max_user_watches"
  echo 256 > /proc/sys/fs/inotify/max_user_instances 2>/dev/null || echo "⚠️ No se pudo configurar max_user_instances"
fi

# Configurar variables de entorno
export NODE_ENV=production
export WATCHMAN_DISABLE=true
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=1000

# Verificar que estamos en el directorio correcto
echo "📁 Current directory: $(pwd)"

# Navegar al directorio de la API para Prisma
cd apps/api

echo "📦 Generating Prisma Client..."
npx prisma generate || {
  echo "❌ Failed to generate Prisma client"
  exit 1
}

echo "🗄️  Setting up database..."
npx prisma migrate deploy || echo "⚠️  Migration failed, continuing..."

# Volver al directorio raíz
cd ../..

echo "🌐 Starting Production Server on port 3000..."

# Verificar si existe el script de inicio mejorado para VPS
if [ -f "scripts/start-vps-production.sh" ]; then
  echo "🚀 Usando script de inicio mejorado para VPS..."
  chmod +x scripts/start-vps-production.sh
  exec ./scripts/start-vps-production.sh
else
  echo "🚀 Usando script de inicio estándar..."
  # Iniciar el servidor de producción (que maneja la API internamente)
  exec node production-server.js
fi
