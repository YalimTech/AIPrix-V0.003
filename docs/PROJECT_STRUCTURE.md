# 🏗️ Estructura del Proyecto PrixAgent SaaS

## 📁 Organización General

```
PrixAgent-SaaS/
├── 📁 apps/                          # Aplicaciones principales
│   ├── 📁 api/                      # Backend API (NestJS)
│   ├── 📁 client-dashboard/         # Dashboard de clientes (React + Vite)
│   ├── 📁 admin-dashboard/          # Dashboard de administración (React + Vite)
│   └── 📁 landing-page/             # Página de aterrizaje (React + Vite)
├── 📁 infrastructure/               # Configuración de infraestructura
│   ├── 📁 docker/                   # Archivos Docker
│   ├── 📁 scripts/                  # Scripts de automatización
│   └── 📁 config/                   # Configuraciones
├── 📁 docs/                         # Documentación del proyecto
├── 📁 tests/                        # Tests end-to-end
└── 📄 Archivos de configuración raíz
```

## 🎯 Aplicaciones

### 🔧 API Backend (`apps/api/`)
- **Tecnología**: NestJS + TypeScript + Prisma
- **Base de datos**: PostgreSQL
- **Funcionalidades**:
  - Autenticación JWT
  - Gestión de agentes de IA
  - Integración con Twilio
  - Integración con ElevenLabs
  - Sistema de billing
  - Webhooks

### 🖥️ Client Dashboard (`apps/client-dashboard/`)
- **Tecnología**: React + TypeScript + Vite
- **Funcionalidades**:
  - Gestión de agentes
  - Configuración de campañas
  - Análisis de llamadas
  - Gestión de contactos

### 👨‍💼 Admin Dashboard (`apps/admin-dashboard/`)
- **Tecnología**: React + TypeScript + Vite
- **Funcionalidades**:
  - Gestión de cuentas
  - Monitoreo del sistema
  - Configuración de billing

### 🌐 Landing Page (`apps/landing-page/`)
- **Tecnología**: React + TypeScript + Vite
- **Funcionalidades**:
  - Página de aterrizaje
  - Información del producto

## 🏗️ Infraestructura

### 🐳 Docker (`infrastructure/docker/`)
- `docker-compose.yml` - Configuración de servicios
- `Dockerfile` - Imagen de la aplicación
- `docker-entrypoint.sh` - Script de inicialización

### 📜 Scripts (`infrastructure/scripts/`)
- Scripts de desarrollo
- Scripts de producción
- Scripts de automatización

### ⚙️ Configuración (`infrastructure/config/`)
- Configuraciones de entorno
- Configuraciones de testing

## 📚 Documentación

### 📖 Guías Principales
- `API_DOCUMENTATION.md` - Documentación de la API
- `DEVELOPER_GUIDE.md` - Guía para desarrolladores
- `SECURITY.md` - Políticas de seguridad

### 🔧 Guías Técnicas
- `TWILIO_SAAS_ARCHITECTURE.md` - Arquitectura de Twilio
- `ELEVENLABS_CONVERSATION_AGENTS_GUIDE.md` - Guía de ElevenLabs
- `SAAS_INTEGRATIONS_ARCHITECTURE.md` - Arquitectura de integraciones

## 🧪 Testing

### 🧪 Tests E2E (`tests/`)
- Tests de API
- Tests de dashboard
- Tests de integración

## 🔧 Configuración

### 📦 Package.json
- Scripts de desarrollo
- Scripts de build
- Scripts de linting
- Scripts de testing

### 🎨 Linting y Formateo
- ESLint para linting
- Prettier para formateo
- Husky para git hooks

## 🚀 Desarrollo

### 🏃‍♂️ Comandos Principales
```bash
# Desarrollo completo
npm run dev

# Desarrollo por aplicación
npm run dev:api
npm run dev:client
npm run dev:manager
npm run dev:landing

# Linting y formateo
npm run lint
npm run format

# Build
npm run build
```

### 🔧 Configuración de Entorno
- Variables de entorno en `.env` (raíz del proyecto)
- Configuración por aplicación en `apps/*/`
- Configuración de Docker en `infrastructure/docker/`

## 📋 Mejores Prácticas

### 🎯 Estructura de Código
- Separación clara de responsabilidades
- Uso de TypeScript en todo el proyecto
- Configuración de linting y formateo automático
- Documentación inline y README por aplicación

### 🔒 Seguridad
- Validación de entrada en todos los endpoints
- Autenticación JWT
- Middleware de seguridad
- Variables de entorno seguras

### 🚀 Performance
- Optimización de builds
- Lazy loading en frontend
- Caching estratégico
- Optimización de base de datos
