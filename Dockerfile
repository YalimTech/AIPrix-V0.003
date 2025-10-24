# Dockerfile para PrixAgent SaaS
FROM node:20-alpine

# Forzar rebuild sin cache
ARG BUILD_DATE=2025-01-27
ARG VERSION=1.0.4
ARG CACHE_BUST=4

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias raíz
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Instalar dependencias de cada aplicación
RUN cd apps/api && npm install --legacy-peer-deps
RUN cd apps/client-dashboard && npm install --legacy-peer-deps
RUN cd apps/admin-dashboard && npm install --legacy-peer-deps
RUN cd apps/landing-page && npm install --legacy-peer-deps

# Construir aplicaciones
RUN cd apps/api && npm run build
RUN cd apps/client-dashboard && npm run build
RUN cd apps/admin-dashboard && npm run build
RUN cd apps/landing-page && npm run build

# Limpiar cache de npm
RUN npm cache clean --force

# Exponer puertos
EXPOSE 3000 3001 3002 3003 3004

# Comando de inicio
CMD ["node", "server.js"]