# 🚀 PrixAgent SaaS - Plataforma de Agentes de IA Conversacional

> **SaaS completo para la gestión de agentes de IA conversacional telefónica con integración Twilio y ElevenLabs**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📑 ÍNDICE

- [🚀 Inicio Rápido](#-inicio-rápido)
- [🎯 Características Principales](#-características-principales)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [🎮 Comandos de Desarrollo](#-comandos-de-desarrollo)
- [🛠️ Tecnologías](#️-tecnologías)
- [📚 Documentación](#-documentación)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [🤝 Contribución](#-contribución)

---

## 🚀 INICIO RÁPIDO

### Para Nuevos Desarrolladores:

1. **Leer primero**: [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md)
   - Visión general del proyecto
   - Tecnologías utilizadas
   - Objetivos del sistema

2. **Configurar entorno**: [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md)
   - Instalación de dependencias
   - Configuración de variables de entorno
   - Comandos de desarrollo

3. **Arquitectura de .env**: [`docs/ARQUITECTURA-ENV-IDEAL-SAAS.md`](docs/ARQUITECTURA-ENV-IDEAL-SAAS.md)
   - ✅ Configuración con UN SOLO `.env`
   - ✅ Arquitectura multi-tenant correcta
   - ✅ Separación de credenciales (plataforma vs clientes)

### Flujo de Desarrollo:

```bash
# 1. Clonar repositorio
git clone https://github.com/YalimTech/AIPrix-V0.002.git
cd AIPrix-V0.002

# 2. Copiar .env.example a .env
cp infrastructure/config/.env.example .env

# 3. Configurar credenciales reales en .env

# 4. Instalar dependencias
npm install

# 5. Iniciar aplicaciones
npm run dev                    # Todas las aplicaciones
# O individualmente:
npm run dev:api               # Puerto 3004
npm run dev:client            # Puerto 3001
npm run dev:manager           # Puerto 3002
npm run dev:landing           # Puerto 3000
```

---

## 🎯 Características Principales

### 🤖 **Agentes de IA Conversacional**
- Creación y gestión de agentes de IA
- Integración con ElevenLabs para voces naturales
- Configuración de personalidades y comportamientos
- Sistema de aprendizaje continuo

### 📞 **Sistema Telefónico Avanzado**
- Integración completa con Twilio
- Gestión de números telefónicos
- Grabación y análisis de llamadas
- Sistema de webhooks en tiempo real

### 📊 **Dashboards Intuitivos**
- **Client Dashboard**: Gestión completa para clientes
- **Admin Dashboard**: Administración del sistema
- **Landing Page**: Página de aterrizaje profesional

### 🔧 **Arquitectura SaaS Multi-tenant**
- Sistema de cuentas independientes
- Billing y suscripciones
- Gestión de usuarios y permisos
- Escalabilidad horizontal

## 🏗️ Arquitectura del Proyecto

```
PrixAgent-SaaS/
├── 📁 apps/
│   ├── 🔧 api/                    # Backend API (NestJS)
│   ├── 🖥️ client-dashboard/       # Dashboard de clientes
│   ├── 👨‍💼 admin-dashboard/      # Dashboard de administración
│   └── 🌐 landing-page/           # Página de aterrizaje
├── 📁 infrastructure/             # Configuración de infraestructura
├── 📁 docs/                       # Documentación
└── 📁 tests/                      # Tests E2E
```

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **PostgreSQL** >= 13.0
- **Docker** (opcional)

### ⚙️ Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/YalimTech/AIPrix-V0.002.git
   cd AIPrix-V0.002
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp infrastructure/config/.env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar base de datos**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

## 🎮 Comandos de Desarrollo

### 🏃‍♂️ Desarrollo
```bash
# Desarrollo completo (todas las aplicaciones)
npm run dev

# Desarrollo por aplicación
npm run dev:api          # Solo API
npm run dev:client       # Solo Client Dashboard
npm run dev:manager      # Solo Admin Dashboard
npm run dev:landing      # Solo Landing Page
```

### 🔧 Linting y Formateo
```bash
# Linting
npm run lint            # Verificar código
npm run lint:fix        # Corregir automáticamente

# Formateo
npm run format          # Formatear código
npm run format:check    # Verificar formateo
```

### 🏗️ Build y Producción
```bash
# Build completo
npm run build

# Build por aplicación
npm run build:api
npm run build:client
npm run build:manager
npm run build:landing
```

## 🛠️ Tecnologías

### 🔧 Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación
- **Swagger** - Documentación de API

### 🖥️ Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS
- **React Query** - Gestión de estado
- **React Router** - Enrutamiento

### 🔌 Integraciones
- **Twilio** - Servicios telefónicos
- **ElevenLabs** - Voces de IA
- **GoHighLevel** - CRM
- **PayPal** - Pagos

## 📚 Documentación

### 🆕 Empezando en el Proyecto:
1. [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) - Visión general del proyecto
2. [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) - Guía completa para desarrolladores
3. [`docs/ARQUITECTURA-ENV-IDEAL-SAAS.md`](docs/ARQUITECTURA-ENV-IDEAL-SAAS.md) - Arquitectura de variables de entorno

### 🏗️ Configurando el Sistema:
1. [`docs/ARQUITECTURA-ENV-IDEAL-SAAS.md`](docs/ARQUITECTURA-ENV-IDEAL-SAAS.md) - Arquitectura multi-tenant
2. [`docs/SECURITY.md`](docs/SECURITY.md) - Guía de seguridad
3. [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) - Documentación de API

### 🔌 Implementando Integraciones:
1. [`docs/INTEGRATIONS_GUIDE.md`](docs/INTEGRATIONS_GUIDE.md) - Guía general de integraciones
2. [`docs/TWILIO_MULTI_TENANT_SETUP_GUIDE.md`](docs/TWILIO_MULTI_TENANT_SETUP_GUIDE.md) - Twilio Multi-Tenant
3. [`docs/ELEVENLABS_CONVERSATION_AGENTS_GUIDE.md`](docs/ELEVENLABS_CONVERSATION_AGENTS_GUIDE.md) - ElevenLabs

### 🎨 Trabajando en Dashboards:
1. [`docs/DASHBOARDS_CONFIGURATION.md`](docs/DASHBOARDS_CONFIGURATION.md) - Configuración de dashboards
2. [`docs/client-dashboard-README.md`](docs/client-dashboard-README.md) - Client Dashboard
3. [`docs/admin-dashboard-structure.md`](docs/admin-dashboard-structure.md) - Admin Dashboard

### 🔧 Guías Técnicas Avanzadas:
- [`docs/TWILIO_SAAS_ARCHITECTURE.md`](docs/TWILIO_SAAS_ARCHITECTURE.md) - Arquitectura Twilio
- [`docs/SAAS_INTEGRATIONS_ARCHITECTURE.md`](docs/SAAS_INTEGRATIONS_ARCHITECTURE.md) - Arquitectura de integraciones
- [`docs/OPTIMIZATION_GUIDE.md`](docs/OPTIMIZATION_GUIDE.md) - Guía de optimización

## 🧪 Testing

### 🧪 Tests E2E
```bash
# Ejecutar todos los tests
npm run test

# Tests específicos
npm run test:api
npm run test:client
npm run test:manager
```

## 🚀 Despliegue

### 🐳 Docker
```bash
# Construir imagen
docker build -t prixagent-saas .

# Ejecutar con Docker Compose
docker-compose up -d
```

### ☁️ Producción
- **Dokploy** - Plataforma de despliegue
- **PostgreSQL** - Base de datos
- **Nginx** - Proxy reverso
- **SSL** - Certificados automáticos

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Email**: support@prixagent.com
- **Documentación**: [docs.prixagent.com](https://docs.prixagent.com)
- **Issues**: [GitHub Issues](https://github.com/YalimTech/AIPrix-V0.002/issues)

## 🎯 Roadmap

### 🚀 Próximas Características
- [ ] Integración con más CRMs
- [ ] Análisis de sentimientos avanzado
- [ ] Dashboard de analytics en tiempo real
- [ ] API pública para desarrolladores
- [ ] Aplicación móvil

---

**Desarrollado con ❤️ por el equipo de PrixAgent**