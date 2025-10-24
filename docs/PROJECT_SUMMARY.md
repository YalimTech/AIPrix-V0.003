# SaaS Agente IA Conversacional Telefónico - Resumen Ejecutivo

## 🎯 Visión del Proyecto

Desarrollar una plataforma SaaS multi-account que permite a las empresas automatizar completamente el contacto telefónico con sus leads mediante una IA con voz natural, logrando alta eficiencia en la calificación y programación de citas.

## 📊 Análisis de las Imágenes de Referencia

Basándome en el análisis profundo de las imágenes del dashboard de referencia, he identificado las siguientes funcionalidades clave:

### Funcionalidades Principales Identificadas:

1. **Dashboard Principal** - Métricas y estadísticas en tiempo real
2. **Gestión de Números Telefónicos** - Compra, asignación y configuración
3. **Agentes de IA** - Configuración inbound/outbound con múltiples voces
4. **Campañas** - Creación y gestión de campañas de llamadas
5. **Contactos** - Importación y gestión de listas de leads
6. **Logs de Llamadas** - Grabaciones, transcripciones y análisis
7. **Configuración** - Twilio, facturación, webhooks externos
8. **Analytics** - Métricas de rendimiento y conversión

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Backend**: NestJS 10+ (TypeScript 5+) + Prisma 6+ ORM
- **Frontend Cliente**: React 18.3.1 + Vite 7+ + TypeScript 5+ + Tailwind CSS 3+
- **Frontend Admin**: React 18.3.1 + Vite 7+ + TypeScript 5+ + Tailwind CSS 3+
- **Landing Page**: React 18.3.1 + Vite 7+ + TypeScript 5+ + Tailwind CSS 3+
- **Base de Datos**: PostgreSQL 15+ + pgvector (RAG)
- **Testing**: Vitest + jsdom (Testing unitario moderno)
- **Build Tool**: Vite 7+ (Bundler ultra rápido con HMR)
- **Proxy Server**: Express.js + http-proxy-middleware
- **Hosting**: Dokploy (Hostinger)
- **Integraciones**: Twilio, OpenAI/Gemini, ElevenLabs, Deepgram, GHL, n8n

### Flujo de Conversación (Latencia < 500ms)

```
Cliente → Twilio → ASR (Deepgram) → LLM (OpenAI/Gemini) → TTS (ElevenLabs) → Twilio → Cliente
```

## 📁 Estructura del Proyecto

### Backend (NestJS)

```
src/
├── modules/
│   ├── auth/           # Autenticación JWT
│   ├── tenancy/        # Multi-tenancy
│   ├── agents/         # Gestión de agentes IA
│   ├── campaigns/      # Campañas de llamadas
│   ├── contacts/       # Gestión de contactos
│   ├── phone-numbers/  # Números telefónicos
│   ├── calls/          # Llamadas y grabaciones
│   ├── orchestrator/   # Núcleo de IA conversacional
│   ├── integrations/   # APIs externas
│   ├── webhooks/       # Webhooks salientes
│   ├── billing/        # Facturación PayPal
│   ├── analytics/      # Métricas y estadísticas
│   └── admin/          # Endpoints de administración
```

### Frontend Cliente (React)

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   ├── hooks/              # Custom hooks
│   ├── services/           # Servicios de API
│   ├── store/              # Estado global (Zustand)
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Utilidades
├── public/                 # Archivos estáticos
└── package.json
```

### Frontend Administración (React - Separado)

```
admin-dashboard/
├── src/
│   ├── components/          # Componentes de administración
│   ├── pages/              # Páginas de admin
│   ├── hooks/              # Hooks específicos de admin
│   ├── services/           # Servicios de API admin
│   ├── store/              # Estado global admin
│   ├── types/              # Tipos específicos de admin
│   └── utils/              # Utilidades de admin
├── public/                 # Archivos estáticos
└── package.json
```

### Base de Datos (PostgreSQL + pgvector)

```
database/
├── migrations/            # Migraciones de esquema
├── seeds/                # Datos iniciales
├── init.sql              # Script de inicialización
└── schema.sql            # Esquema completo
## 🌐 URLs y Acceso

### Dashboard de Clientes
- **URL**: `https://app.yourapp.com`
- **Acceso**: Solo clientes (accounts)
- **Funcionalidades**: Gestión de agentes, campañas, contactos, etc.

### Dashboard de Administración
- **URL**: `https://admin.yourapp.com`
- **Acceso**: Solo administradores/desarrolladores
- **Funcionalidades**: Gestión del SaaS, métricas, configuración, etc.

### API Backend
- **URL**: `https://api.yourapp.com`
- **Documentación**: `https://api.yourapp.com/api`
- **Admin API**: `https://api.yourapp.com/api/v1/admin`

## 🔧 Configuración de Modelos LLM

### Modelos Actuales (Septiembre 2025)
**OpenAI:**
- GPT-5 (200K tokens) - $0.00005/token
- GPT-4o (128K tokens) - $0.000015/token
- GPT-4o Mini (128K tokens) - $0.000003/token
- GPT-4 Turbo (128K tokens) - $0.00001/token

**Gemini:**
- Gemini 2.5 Pro (1M tokens) - $0.00002/token
- Gemini 2.5 Flash (1M tokens) - $0.00001/token
- Gemini 1.5 Pro (8K tokens) - $0.00001/token
- Gemini 1.5 Flash (8K tokens) - $0.000005/token

### Características de los Modelos
- **GPT-5**: Razonamiento avanzado, orquestación de múltiples pasos
- **Gemini 2.5 Pro**: Capacidades de "pensamiento", procesamiento multimodal
- **Fallback automático**: Si falla el proveedor principal, usa el secundario
- **Configuración flexible**: Cada agente puede usar un modelo diferente

## 🎯 Funcionalidades del Dashboard de Administración

### 1. **Gestión de Modelos LLM**
- Agregar nuevos modelos fácilmente
- Configurar costos y límites
- Activar/desactivar modelos
- Monitorear uso y rendimiento

### 2. **Gestión de Accounts**
- Crear/editar/eliminar accounts
- Suspender/activar cuentas
- Gestión de facturación
- Monitoreo de uso

### 3. **Analytics Avanzados**
- Métricas de ingresos
- Uso de recursos
- Rendimiento del sistema
- Análisis de usuarios

### 4. **Monitoreo del Sistema**
- Salud del sistema
- Métricas de rendimiento
- Alertas automáticas
- Logs del sistema

### 5. **Gestión de Seguridad**
- Control de acceso basado en roles
- Auditoría de acciones
- Gestión de API keys
- Monitoreo de seguridad

### 6. **Soporte**
- Tickets de soporte
- Base de conocimiento
- FAQ
- Chat en vivo

## 🗄️ Base de Datos Multi-Account

### Tablas Principales
- `accounts` - Empresas clientes
- `users` - Usuarios del sistema
- `agents` - Agentes de IA
- `campaigns` - Campañas de llamadas
- `contacts` - Contactos y leads
- `phone_numbers` - Números telefónicos
- `calls` - Llamadas y grabaciones
- `knowledge_base` - Base de conocimiento RAG
- `billing_config` - Configuración de facturación
- `webhooks` - Webhooks externos

### Características
- **Row Level Security (RLS)** para aislamiento de datos
- **pgvector** para búsqueda semántica RAG
- **Índices optimizados** para consultas multi-account
- **Triggers automáticos** para actualización de timestamps

## 🔌 Integraciones Externas

### 1. Twilio Voice API
- Compra y gestión de números telefónicos
- Iniciación de llamadas
- Webhooks para eventos de llamada
- Grabación de llamadas

### 2. LLM (OpenAI/GPT + Gemini)
- Procesamiento de lenguaje natural
- Generación de respuestas contextuales
- Integración con base de conocimiento RAG
- Soporte para múltiples proveedores con fallback automático

### 3. ElevenLabs TTS
- Generación de voz natural
- Múltiples modelos de voz
- Clonación de voz personalizada

### 4. Deepgram ASR
- Transcripción en tiempo real
- Detección de fin de habla (VAD)
- Procesamiento de audio streaming

### 5. GoHighLevel (GHL)
- Integración OAuth 2.0
- Sincronización de contactos
- Creación de oportunidades
- Agendamiento de citas

### 6. Cal.com
- Agendamiento de citas
- Validación de API keys
- Gestión de tipos de eventos

### 7. n8n Webhooks
- Webhooks salientes
- Integración con automatizaciones
- Eventos personalizables

### 8. PayPal
- Facturación recurrente
- Gestión de suscripciones
- Procesamiento de pagos

## 📋 API REST Endpoints

### Principales Endpoints
- `POST /auth/login` - Autenticación
- `GET /agents` - Lista de agentes
- `POST /agents` - Crear agente
- `GET /campaigns` - Lista de campañas
- `POST /campaigns` - Crear campaña
- `GET /contacts` - Lista de contactos
- `POST /contacts/import` - Importar contactos
- `GET /calls` - Logs de llamadas
- `GET /analytics/dashboard` - Métricas del dashboard
- `POST /webhooks` - Configurar webhooks

### Características
- **Autenticación JWT** en todos los endpoints
- **Multi-tenancy** con header `X-Account-ID`
- **Paginación** estándar
- **Filtros y búsqueda** avanzados
- **Rate limiting** por account
- **Validación** de datos con DTOs

## 🎨 Interfaz de Usuario

### Componentes Principales
- **Sidebar de navegación** con menú desplegable
- **Dashboard** con tarjetas de métricas
- **Formularios** para crear/editar agentes
- **Tablas** con paginación y filtros
- **Modales** para configuraciones
- **Gráficos** para analytics
- **Reproductor de audio** para grabaciones

### Características de UX
- **Diseño responsivo** con Tailwind CSS
- **Tema claro/oscuro** (opcional)
- **Loading states** y error handling
- **Confirmaciones** para acciones destructivas
- **Toast notifications** para feedback
- **Breadcrumbs** para navegación

## 🚀 Plan de Implementación

### Fase 1: Backend Core (4-6 semanas)
1. Configuración del proyecto NestJS
2. Implementación de módulos básicos (auth, tenancy, users)
3. Configuración de base de datos y migraciones
4. Implementación de módulo de agentes
5. Integración básica con Twilio

### Fase 2: IA Conversacional (3-4 semanas)
1. Implementación del módulo orchestrator
2. Integración con OpenAI para LLM
3. Integración con ElevenLabs para TTS
4. Integración con Deepgram para ASR
5. Implementación de base de conocimiento RAG

### Fase 3: Frontend (4-5 semanas)
1. Configuración del proyecto React
2. Implementación de componentes base
3. Páginas principales (dashboard, agentes, campañas)
4. Integración con API backend
5. Testing y optimización

### Fase 4: Integraciones (3-4 semanas)
1. Integración con GoHighLevel
2. Integración con Cal.com
3. Sistema de webhooks
4. Integración con PayPal
5. Testing de integraciones

### Fase 5: Testing y Deploy (2-3 semanas)
1. Testing end-to-end
2. Optimización de performance
3. Configuración de producción
4. Deploy en Dokploy
5. Monitoreo y logging

## 💰 Modelo de Negocio

### Planes de Suscripción
- **Basic**: $29/mes - 500 minutos, 1000 llamadas
- **Pro**: $79/mes - 2000 minutos, 5000 llamadas
- **Enterprise**: $199/mes - 10000 minutos, 25000 llamadas

### Costos Operacionales
- **Twilio**: ~$0.05 por minuto
- **OpenAI**: ~$0.05 por 1K tokens (GPT-5)
- **Gemini**: ~$0.02 por 1K tokens (Gemini 2.5 Pro)
- **ElevenLabs**: ~$0.30 por 1K caracteres
- **Deepgram**: ~$0.0043 por minuto
- **Hosting**: ~$50/mes (Dokploy)

### Margen Estimado
- **Basic**: 60% margen
- **Pro**: 70% margen
- **Enterprise**: 75% margen

## 🔒 Seguridad y Compliance

### Medidas de Seguridad
- **Autenticación JWT** con refresh tokens
- **Row Level Security** en base de datos
- **Validación** de entrada en todos los endpoints
- **Rate limiting** por account
- **Encriptación** de datos sensibles
- **Logs de auditoría** para compliance

### Compliance
- **GDPR** para datos de contactos
- **CCPA** para privacidad
- **HIPAA** (opcional) para datos médicos
- **SOC 2** para seguridad empresarial

## 📈 Métricas de Éxito

### KPIs Técnicos
- **Latencia de respuesta**: < 500ms
- **Uptime**: > 99.9%
- **Tiempo de respuesta API**: < 200ms
- **Tasa de error**: < 0.1%

### KPIs de Negocio
- **Tasa de conversión**: > 15%
- **Tiempo de respuesta**: < 2 segundos
- **Satisfacción del cliente**: > 4.5/5
- **Retención de clientes**: > 90%

## 🎯 Próximos Pasos

1. **Validación del mercado** con clientes potenciales
2. **Prototipo MVP** con funcionalidades básicas
3. **Testing con usuarios** beta
4. **Iteración** basada en feedback
5. **Lanzamiento** público
6. **Escalamiento** y optimización

## 📞 Contacto

Para más información sobre este proyecto, contactar al equipo de desarrollo.

---

**Nota**: Este documento es un resumen ejecutivo del análisis completo realizado. Para detalles técnicos específicos, consultar los archivos de documentación correspondientes.
```
