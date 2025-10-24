# Multi-stage build optimizado para PrixAgent SaaS
# Usar imagen más estable con fallback automático
# Usar mirror confiable para evitar 503 de Docker Hub
FROM mirror.gcr.io/library/node:20-slim AS builder

# Instalar dependencias del sistema necesarias con retry
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/client-dashboard/package*.json ./apps/client-dashboard/
COPY apps/admin-dashboard/package*.json ./apps/admin-dashboard/
COPY apps/landing-page/package*.json ./apps/landing-page/

# Copiar archivos .npmrc para forzar uso de dependencias del root
COPY apps/api/.npmrc ./apps/api/
COPY apps/client-dashboard/.npmrc ./apps/client-dashboard/
COPY apps/admin-dashboard/.npmrc ./apps/admin-dashboard/
COPY apps/landing-page/.npmrc ./apps/landing-page/

# Limpiar cache y eliminar archivos de lock problemáticos
RUN npm cache clean --force && \
    rm -f package-lock.json && \
    rm -f apps/*/package-lock.json

# Instalar dependencias con flags optimizados
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copiar todo el código fuente
COPY . .

# Usar nuestro script de corrección de dependencias
RUN node scripts/fix-dependencies-production.js

# Build optimizado con variables de entorno
RUN echo "🏗️ Ejecutando build optimizado con variables de entorno..." && \
    node scripts/build-with-env.js

# Verificar que el build fue exitoso
RUN echo "🔍 Verificando build..." && \
    ls -la apps/api/dist/main.js && \
    ls -la apps/client-dashboard/dist/index.html && \
    ls -la apps/admin-dashboard/dist/index.html && \
    ls -la apps/landing-page/dist/index.html

# Etapa de producción
# Usar el mismo mirror en producción para consistencia
FROM mirror.gcr.io/library/node:20-slim AS production

# Instalar dependencias del sistema necesarias con retry
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configurar límites básicos del sistema
RUN echo "fs.file-max = 65536" > /etc/sysctl.conf

# Copiar archivos de configuración de paquetes
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/client-dashboard/package*.json ./apps/client-dashboard/
COPY apps/admin-dashboard/package*.json ./apps/admin-dashboard/
COPY apps/landing-page/package*.json ./apps/landing-page/

# Copiar archivos .npmrc
COPY apps/api/.npmrc ./apps/api/
COPY apps/client-dashboard/.npmrc ./apps/client-dashboard/
COPY apps/admin-dashboard/.npmrc ./apps/admin-dashboard/
COPY apps/landing-page/.npmrc ./apps/landing-page/

# Configurar npm para reducir warnings y el uso de archivos
RUN npm config set audit false && \
    npm config set fund false && \
    npm config set update-notifier false && \
    npm config set loglevel error && \
    npm config set progress false

# Instalar todas las dependencias (incluyendo dev) para compilar la API
RUN npm install --legacy-peer-deps --no-audit --no-fund --maxsockets 1 --silent

# Copiar archivos construidos desde la etapa builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/client-dashboard/dist ./apps/client-dashboard/dist
COPY --from=builder /app/apps/admin-dashboard/dist ./apps/admin-dashboard/dist
COPY --from=builder /app/apps/landing-page/dist ./apps/landing-page/dist

# Copiar archivos necesarios para producción
COPY server.js ./
COPY production-server.js ./
COPY docker-entrypoint.sh ./
COPY scripts/eliminate-tail-warning.sh ./scripts/
COPY scripts/dokploy-logging-fix.sh ./scripts/
COPY scripts/disable-tail-warnings.sh ./scripts/
COPY scripts/init-system.sh ./scripts/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/src ./apps/api/src
COPY apps/api/package.json ./apps/api/
COPY apps/api/start-production.js ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/

# Copiar .env si existe
COPY .env* ./

# Configurar límites del sistema de forma simple
RUN echo "fs.file-max = 65536" > /etc/sysctl.conf && \
    echo "fs.inotify.max_user_watches = 524288" >> /etc/sysctl.conf && \
    echo "fs.inotify.max_user_instances = 256" >> /etc/sysctl.conf

# Configurar variables de entorno para producción
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --max-http-header-size=80000"
ENV UV_THREADPOOL_SIZE=128
ENV NODE_NO_WARNINGS=1
ENV WATCHMAN_DISABLE=true
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=1000

# Exponer puertos
EXPOSE 3000 3004

# Health check optimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Script de inicio optimizado con manejo de límites de archivos
CMD ["sh", "-c", "echo '🚀 Starting PrixAgent SaaS Production Server...' && ulimit -n 65536 2>/dev/null || true && echo 65536 > /proc/sys/fs/file-max 2>/dev/null || true && chmod +x docker-entrypoint.sh && ./docker-entrypoint.sh"]