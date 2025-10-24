# 🏗️ ARQUITECTURA IDEAL DE `.env` PARA SAAS MULTI-TENANT

## 📁 Estructura Completa del Repositorio

SOLO HAY UN .ENV Y YA ESTA CREADO EN LA RAIZ DEL PROYECTO Y CONTINE LA BASE DE DATOS POSTGRESQL CONFIGURADA.

### ✅ Arquitectura Recomendada (UN SOLO `.env`):

```
PrixAgent V0.01/
│
├── .env                              ← ✅ UN SOLO archivo con configuración de LA PLATAFORMA
├── .env.example                      ← ✅ Plantilla sin credenciales (va a Git)
├── .gitignore                        ← ✅ Protege el .env real
├── .npmrc                            ← Configuración de npm (si aplica)
├── package.json                      ← Dependencias raíz del monorepo
├── package-lock.json
├── tsconfig.json                     ← TypeScript config base
├── README.md                         ← Documentación principal
│
├── apps/                             ← Aplicaciones del monorepo
│   │
│   ├── client-dashboard/             ← Dashboard del Cliente
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts            ← Lee CLIENT_PORT del .env raíz
│   │   ├── package.json              ← Script: dotenv -e ../../.env -- vite
│   │   ├── tsconfig.json
│   │   └── ❌ SIN .env propio        ← Lee del .env raíz
│   │
│   ├── admin-dashboard/              ← Dashboard del Admin
│   │   ├── src/
│   │   ├── public/
│   │   ├── vite.config.ts            ← Lee ADMIN_PORT del .env raíz
│   │   ├── package.json              ← Script: dotenv -e ../../.env -- vite
│   │   └── ❌ SIN .env propio        ← Lee del .env raíz
│   │
│   ├── landing-page/                 ← Landing Page
│   │   ├── src/
│   │   ├── public/
│   │   ├── vite.config.ts            ← Lee PORT del .env raíz
│   │   ├── package.json
│   │   └── ❌ SIN .env propio        ← Lee del .env raíz
│   │
│   └── api/                          ← Backend API (NestJS)
│       ├── src/
│       │   ├── auth/
│       │   ├── integrations/
│       │   │   ├── twilio/
│       │   │   ├── ghl/
│       │   │   └── elevenlabs/
│       │   ├── calls/
│       │   ├── campaigns/
│       │   ├── contacts/
│       │   ├── agents/
│       │   ├── utils/
│       │   │   └── encryption.ts     ← Funciones encrypt/decrypt
│       │   ├── main.ts               ← Lee API_PORT del .env raíz
│       │   └── app.module.ts
│       ├── prisma/
│       │   ├── schema.prisma         ← Modelo de DB (tabla accounts)
│       │   └── migrations/
│       ├── nest-cli.json
│       ├── package.json
│       └── ❌ SIN .env propio        ← Lee del .env raíz
│
├── docs/                             ← Documentación del proyecto
│   ├── ARQUITECTURA-ENV-IDEAL-SAAS.md
│   ├── API_DOCUMENTATION.md
│   ├── SECURITY.md
│   └── ...
│
├── scripts/                          ← Scripts utilitarios
│   ├── setup-credentials.js
│   ├── security-check.js
│   └── ...
│
├── tests/                            ← Tests E2E
│   └── e2e/
│
└── logs/                             ← Logs de la aplicación (no va a Git)
    └── .gitkeep
```

---

## 🎯 Principio Fundamental: UN SOLO `.env` en la Raíz

### ✅ RAZONES para usar UN SOLO `.env`:

1. **📍 Una Sola Fuente de Verdad**
   - Toda la configuración en UN lugar
   - No hay confusión sobre qué archivo se está usando
   - Cambios se hacen en UN solo sitio

2. **🚫 Sin Duplicación**
   - Variables como `CLIENT_PORT`, `API_PORT` aparecen UNA sola vez
   - No hay riesgo de desincronización
   - Menos mantenimiento

3. **🔒 Seguridad Centralizada**
   - Solo UN archivo que proteger
   - Más fácil de gestionar permisos
   - Un solo lugar para auditar

4. **🎨 Mejor Organización**
   - Estructura limpia y profesional
   - Fácil de entender para nuevos desarrolladores
   - Sigue estándares de la industria

5. **⚡ Escalabilidad**
   - Agregar nuevas apps es simple
   - Solo se agregan variables al .env raíz
   - No se crean archivos duplicados

---

## 📝 Cómo Cada App Lee el `.env` Raíz

### 1. **Client Dashboard** (`apps/client-dashboard/`):

```json
// package.json
{
  "scripts": {
    "dev": "dotenv -e ../../.env -- cross-env vite"
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.CLIENT_PORT || "3001"), // Lee del .env raíz
  },
});
```

### 2. **Admin Dashboard** (`apps/admin-dashboard/`):

```json
// package.json
{
  "scripts": {
    "dev": "dotenv -e ../../.env -- cross-env vite"
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.ADMIN_PORT || "3002"), // Lee del .env raíz
  },
});
```

### 3. **API Backend** (`apps/api/`):

```json
// package.json
{
  "scripts": {
    "start:dev": "dotenv -e ../../.env -- nest start --watch"
  }
}
```

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT || 3004; // Lee del .env raíz
  await app.listen(port);
}
```

---

## 🔄 Flujo de Inicialización

### Cuando ejecutas cada aplicación:

```bash
# Client Dashboard
cd apps/client-dashboard
npm run dev
# → Carga .env de la raíz (../../.env)
# → Lee CLIENT_PORT=3001
# → Inicia en http://localhost:3001

# Admin Dashboard
cd apps/admin-dashboard
npm run dev
# → Carga .env de la raíz (../../.env)
# → Lee ADMIN_PORT=3002
# → Inicia en http://localhost:3002

# API Backend
cd apps/api
npm run start:dev
# → Carga .env de la raíz (../../.env)
# → Lee API_PORT=3004
# → Inicia en http://localhost:3004
```

**Todos leyendo del MISMO archivo, cada uno usando SU variable específica.**

---

## 📝 Contenido del `.env` (Raíz del Proyecto)

### ✅ QUÉ DEBE CONTENER:

Configuración de **LA PLATAFORMA** (no de los clientes):

```env
# ===================================
# CONFIGURACIÓN DE PUERTOS
# ===================================
# Cada aplicación de la plataforma usa su propio puerto
PORT=3000                    # Landing Page
CLIENT_PORT=3001            # Client Dashboard
ADMIN_PORT=3002             # Admin Dashboard
AGENCY_PORT=3003            # Agency Dashboard
API_PORT=3004               # API Backend
LANDING_PORT=3000           # Legacy compatibility

# ===================================
# BASE DE DATOS CENTRAL
# ===================================
# Base de datos donde se almacenan TODOS los clientes y sus datos
DATABASE_URL=postgresql://username:password@host:port/database

# ===================================
# CREDENCIALES DEL SISTEMA/ADMIN
# ===================================
# Credenciales del SUPER ADMINISTRADOR de la PLATAFORMA (tú)
# Estas credenciales permiten acceso al Admin Dashboard
# y control total del sistema
ADMIN_EMAIL=admin@aiprix.com
ADMIN_PASSWORD=admin123

# ===================================
# JWT (Autenticación de la Plataforma)
# ===================================
# Para autenticación de usuarios de la plataforma
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_ISSUER=prixagent-saas
JWT_AUDIENCE=prixagent-users
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# ===================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ===================================
NODE_ENV=development
API_URL=http://localhost:3004/api/v1
WS_URL=http://localhost:3004

# ===================================
# CORS
# ===================================
# Orígenes permitidos para la plataforma
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3000

# ===================================
# ENCRIPTACIÓN
# ===================================
# Clave para encriptar credenciales de clientes en la base de datos
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENCRYPTION_ALGORITHM=aes-256-gcm

# ===================================
# CREDENCIALES DE SERVICIOS DE LA PLATAFORMA
# ===================================
# ElevenLabs (la plataforma genera audio para TODOS los clientes)
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=your-default-voice-id

# PayPal (la plataforma cobra a los clientes)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox

# ===================================
# CONFIGURACIÓN DE SESIONES
# ===================================
SESSION_SECRET=your-session-secret-key
SESSION_EXPIRES_IN=86400

# ===================================
# LOGS Y MONITOREO
# ===================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# ===================================
# LÍMITES Y CUOTAS
# ===================================
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔐 Tipos de Credenciales en el Sistema

### 1️⃣ **Credenciales de la PLATAFORMA** → ✅ VAN en el `.env`

#### A) Credenciales del Administrador del Sistema:

```env
# Credenciales para ACCEDER AL ADMIN DASHBOARD
ADMIN_EMAIL=admin@aiprix.com           # ← Email del super admin
ADMIN_PASSWORD=admin123                # ← Contraseña del super admin

# Estas credenciales permiten:
# ✅ Acceso al Admin Dashboard (http://localhost:3002)
# ✅ Gestionar todos los clientes
# ✅ Ver estadísticas globales
# ✅ Configurar la plataforma
# ✅ Control total del sistema
```

#### B) Credenciales de Servicios Compartidos:

```env
# ElevenLabs - La PLATAFORMA genera audio para TODOS los clientes
ELEVENLABS_API_KEY=sk-...              # ← Cuenta de la plataforma
ELEVENLABS_VOICE_ID=voice-id           # ← Voz por defecto

# PayPal - La PLATAFORMA cobra a los clientes
PAYPAL_CLIENT_ID=client-id             # ← Cuenta de la plataforma
PAYPAL_SECRET=secret                   # ← Para procesar pagos
PAYPAL_MODE=sandbox                    # ← sandbox o live

# ¿Por qué estas credenciales van en el .env?
# ✅ ElevenLabs: La plataforma genera las voces/conversaciones para todos
# ✅ PayPal: La plataforma cobra las suscripciones/servicios a los clientes
```

**Flujo de Login del Admin:**

```typescript
// apps/admin-dashboard/src/pages/Login.tsx
const handleLogin = async (email: string, password: string) => {
  // Verifica contra las credenciales del .env
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Acceso concedido al Admin Dashboard
    setIsAdmin(true);
    navigate("/admin/dashboard");
  }
};
```

---

### 2️⃣ **Credenciales de CLIENTES** → ❌ VAN en la BASE DE DATOS

Estas son las credenciales que **cada cliente** usa para sus propias operaciones:

```typescript
// Cada cliente en la base de datos tiene:
{
  id: "client-123",
  name: "Empresa ABC",
  email: "cliente@empresa.com",           // Email del cliente
  password: "hashed_password",            // Contraseña del cliente

  // Credenciales de integraciones (ENCRIPTADAS)
  twilio_account_sid: "ENCRYPTED...",     // Twilio del cliente
  twilio_auth_token: "ENCRYPTED...",      // Token Twilio del cliente
  ghl_api_key: "ENCRYPTED...",            // GoHighLevel del cliente
  ghl_location_id: "location-123",        // Location ID de GHL
  calcom_api_key: "ENCRYPTED...",         // Cal.com del cliente
}
```

**Flujo de Login del Cliente:**

```typescript
// apps/client-dashboard/src/pages/Login.tsx
const handleLogin = async (email: string, password: string) => {
  // Verifica contra la base de datos
  const response = await apiClient.post("/auth/login", {
    email,
    password,
  });

  // Cada cliente accede a SU dashboard con SUS datos
  setUser(response.user);
  navigate("/dashboard");
};
```

---

### 📊 Comparación Visual:

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN DE LA PLATAFORMA (TÚ)                                    │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  .env                                                 │       │
│  │  ADMIN_EMAIL=admin@aiprix.com                        │       │
│  │  ADMIN_PASSWORD=admin123                             │       │
│  └──────────────────────────────────────────────────────┘       │
│         ↓                                                        │
│  Accede a: http://localhost:3002 (Admin Dashboard)              │
│  Puede hacer:                                                    │
│  ✅ Ver TODOS los clientes                                      │
│  ✅ Gestionar usuarios                                          │
│  ✅ Ver métricas globales                                       │
│  ✅ Configurar la plataforma                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CLIENTES (Empresas que usan tu plataforma)                     │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  BASE DE DATOS                                        │       │
│  │  Cliente 1: email=cliente1@empresa.com               │       │
│  │  Cliente 2: email=cliente2@empresa.com               │       │
│  │  Cliente 3: email=cliente3@empresa.com               │       │
│  └──────────────────────────────────────────────────────┘       │
│         ↓                                                        │
│  Acceden a: http://localhost:3001 (Client Dashboard)            │
│  Pueden hacer:                                                   │
│  ✅ Ver solo SUS datos                                          │
│  ✅ Configurar SUS integraciones                                │
│  ✅ Hacer llamadas con SUS credenciales Twilio                  │
│  ✅ Gestionar SUS campañas                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### ❌ QUÉ NO DEBE CONTENER:

Credenciales **ESPECÍFICAS DE CADA CLIENTE** (van en la base de datos):

```env
# ❌ NUNCA INCLUIR ESTO EN EL .env
TWILIO_ACCOUNT_SID=ACxxxx...           # Cada cliente conecta el suyo
TWILIO_AUTH_TOKEN=xxx...               # Cada cliente conecta el suyo
GHL_API_KEY=xxx...                     # Cada cliente conecta el suyo
CALCOM_API_KEY=xxx...                  # Cada cliente conecta el suyo
```

**NOTA IMPORTANTE**:

- ✅ **ElevenLabs** y **PayPal** SÍ van en el `.env` porque son servicios de LA PLATAFORMA
- ❌ **Twilio**, **GoHighLevel**, **Cal.com** NO van en el `.env` porque cada cliente usa el suyo

---

## 🗄️ Credenciales de Clientes en la Base de Datos

### Estructura de la Tabla `accounts`:

```sql
CREATE TABLE accounts (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Estado de la cuenta
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
  subscription_plan VARCHAR(100),
  subscription_status VARCHAR(50),

  -- Credenciales de Twilio (ENCRIPTADAS)
  twilio_account_sid TEXT,              -- Encriptado
  twilio_auth_token TEXT,               -- Encriptado
  twilio_phone_numbers JSONB,           -- [{number, sid, capabilities}]
  twilio_configured BOOLEAN DEFAULT false,

  -- Credenciales de GoHighLevel (ENCRIPTADAS)
  ghl_api_key TEXT,                     -- Encriptado
  ghl_location_id VARCHAR(255),
  ghl_configured BOOLEAN DEFAULT false,

  -- Credenciales de ElevenLabs (ENCRIPTADAS)
  elevenlabs_api_key TEXT,              -- Encriptado
  elevenlabs_agent_id VARCHAR(255),
  elevenlabs_configured BOOLEAN DEFAULT false,

  -- Credenciales de Cal.com (ENCRIPTADAS)
  calcom_api_key TEXT,                  -- Encriptado
  calcom_configured BOOLEAN DEFAULT false,

  -- Configuración específica del cliente
  settings JSONB,                       -- Configuraciones personalizadas
  limits JSONB,                         -- Límites de uso
  usage_stats JSONB,                    -- Estadísticas de uso

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,

  -- Índices para búsqueda rápida
  INDEX idx_accounts_slug (slug),
  INDEX idx_accounts_email (email),
  INDEX idx_accounts_status (status)
);
```

---

## 🔐 Sistema de Encriptación de Credenciales

### Implementación en el Backend:

```typescript
// apps/api/src/utils/encryption.ts

import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm";

/**
 * Encripta datos sensibles antes de guardarlos en la base de datos
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Retorna: iv:encrypted:authTag
  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
}

/**
 * Desencripta datos cuando se necesitan usar
 */
export function decrypt(encryptedData: string): string {
  const [ivHex, encrypted, authTagHex] = encryptedData.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

---

## 🔄 Flujo de Trabajo Multi-Tenant

### 1. Cliente se Registra:

```typescript
// apps/api/src/auth/auth.service.ts

async createAccount(data: CreateAccountDto) {
  const account = await this.prisma.account.create({
    data: {
      name: data.name,
      email: data.email,
      slug: data.slug,
      // Credenciales inicialmente vacías
      twilio_configured: false,
      ghl_configured: false,
      elevenlabs_configured: false,
    }
  });

  return account;
}
```

### 2. Cliente Configura sus Integraciones:

```typescript
// apps/api/src/integrations/integrations.service.ts

async configureTwilio(accountId: string, credentials: TwilioCredentials) {
  // 1. Validar credenciales con Twilio
  const isValid = await this.validateTwilioCredentials(credentials);

  if (!isValid) {
    throw new Error('Invalid Twilio credentials');
  }

  // 2. Encriptar y guardar
  await this.prisma.account.update({
    where: { id: accountId },
    data: {
      twilio_account_sid: encrypt(credentials.accountSid),
      twilio_auth_token: encrypt(credentials.authToken),
      twilio_configured: true,
      updated_at: new Date(),
    }
  });
}

async configureGoHighLevel(accountId: string, credentials: GHLCredentials) {
  // Similar proceso
  const isValid = await this.validateGHLCredentials(credentials);

  if (!isValid) {
    throw new Error('Invalid GoHighLevel credentials');
  }

  await this.prisma.account.update({
    where: { id: accountId },
    data: {
      ghl_api_key: encrypt(credentials.apiKey),
      ghl_location_id: credentials.locationId,
      ghl_configured: true,
      updated_at: new Date(),
    }
  });
}
```

### 3. Sistema Usa las Credenciales del Cliente:

```typescript
// apps/api/src/calls/calls.service.ts

async makeCall(accountId: string, callData: MakeCallDto) {
  // 1. Obtener cuenta con credenciales
  const account = await this.prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account.twilio_configured) {
    throw new Error('Twilio not configured for this account');
  }

  // 2. Desencriptar credenciales
  const twilioSid = decrypt(account.twilio_account_sid);
  const twilioToken = decrypt(account.twilio_auth_token);

  // 3. Crear cliente Twilio CON LAS CREDENCIALES DEL CLIENTE
  const twilioClient = new Twilio(twilioSid, twilioToken);

  // 4. Hacer la llamada
  const call = await twilioClient.calls.create({
    to: callData.to,
    from: callData.from,
    url: callData.twimlUrl,
  });

  return call;
}
```

---

## 🎯 Comparación: Antes vs. Después

### ❌ ANTES (Incorrecto para SaaS):

```
.env:
├── CLIENT_PORT=3001
├── TWILIO_ACCOUNT_SID=AC123...    ← ❌ Solo un cliente podría usar Twilio
├── TWILIO_AUTH_TOKEN=xxx...       ← ❌ Todos los clientes usan las mismas credenciales
└── GHL_API_KEY=xxx...             ← ❌ No es multi-tenant
```

### ✅ DESPUÉS (Correcto para SaaS):

```
.env:
├── CLIENT_PORT=3001               ← ✅ Configuración de la plataforma
├── DATABASE_URL=...               ← ✅ Base de datos central
├── JWT_SECRET=...                 ← ✅ Para autenticación de la plataforma
└── ENCRYPTION_KEY=...             ← ✅ Para encriptar credenciales de clientes

Base de Datos:
├── Cliente 1:
│   ├── twilio_account_sid: "ENCRYPTED_AC123..."
│   ├── twilio_auth_token: "ENCRYPTED_xyz..."
│   ├── ghl_api_key: "ENCRYPTED_ghl123..."
│   └── calcom_api_key: "ENCRYPTED_cal123..."
│
├── Cliente 2:
│   ├── twilio_account_sid: "ENCRYPTED_AC456..."  ← Diferentes credenciales
│   ├── twilio_auth_token: "ENCRYPTED_abc..."
│   ├── ghl_api_key: "ENCRYPTED_ghl456..."
│   └── calcom_api_key: "ENCRYPTED_cal456..."
│
└── Cliente 3:
    ├── twilio_account_sid: "ENCRYPTED_AC789..."  ← Cada uno tiene las suyas
    ├── twilio_auth_token: "ENCRYPTED_def..."
    ├── ghl_api_key: "ENCRYPTED_ghl789..."
    └── calcom_api_key: "ENCRYPTED_cal789..."
```

---

## 📋 Archivo `.env.example` (Para Git)

```env
# ===================================
# CONFIGURACIÓN DE PUERTOS
# ===================================
PORT=3000
CLIENT_PORT=3001
ADMIN_PORT=3002
AGENCY_PORT=3003
API_PORT=3004
LANDING_PORT=3000

# ===================================
# BASE DE DATOS
# ===================================
DATABASE_URL=postgresql://user:password@host:port/database

# ===================================
# ADMIN DE LA PLATAFORMA
# ===================================
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# ===================================
# JWT
# ===================================
JWT_SECRET=your-jwt-secret-key-min-32-characters
JWT_EXPIRES_IN=24h
JWT_ISSUER=prixagent-saas
JWT_AUDIENCE=prixagent-users
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# ===================================
# CONFIGURACIÓN DE LA APP
# ===================================
NODE_ENV=development
API_URL=http://localhost:3004/api/v1
WS_URL=http://localhost:3004

# ===================================
# CORS
# ===================================
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3000

# ===================================
# ENCRIPTACIÓN
# ===================================
# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENCRYPTION_ALGORITHM=aes-256-gcm

# ===================================
# SESIONES
# ===================================
SESSION_SECRET=your-session-secret-key
SESSION_EXPIRES_IN=86400

# ===================================
# LOGS
# ===================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# ===================================
# LÍMITES DE RATE
# ===================================
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔒 Configuración de `.gitignore`

```gitignore
# Variables de entorno con credenciales REALES
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# PERMITIR el archivo de ejemplo
!.env.example
```

---

## 📊 Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│  .env (CONFIGURACIÓN DE LA PLATAFORMA)                       │
│  ├── Puertos (CLIENT_PORT, ADMIN_PORT, API_PORT)            │
│  ├── Base de datos central                                   │
│  ├── JWT para autenticación de la plataforma                │
│  └── Clave de encriptación                                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  BASE DE DATOS CENTRAL (PostgreSQL)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Cliente 1: "Empresa ABC"                            │    │
│  │  ├── twilio_account_sid: ENCRYPTED                  │    │
│  │  ├── twilio_auth_token: ENCRYPTED                   │    │
│  │  ├── ghl_api_key: ENCRYPTED                         │    │
│  │  └── elevenlabs_api_key: ENCRYPTED                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Cliente 2: "Empresa XYZ"                            │    │
│  │  ├── twilio_account_sid: ENCRYPTED (diferentes)     │    │
│  │  ├── twilio_auth_token: ENCRYPTED (diferentes)      │    │
│  │  ├── ghl_api_key: ENCRYPTED (diferentes)            │    │
│  │  └── elevenlabs_api_key: ENCRYPTED (diferentes)     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  API Backend                                                  │
│  ├── Desencripta credenciales del cliente específico        │
│  ├── Crea cliente Twilio/GHL con ESAS credenciales          │
│  └── Hace la operación (llamada, webhook, etc.)             │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Ventajas de esta Arquitectura

1. **Verdadero Multi-Tenant**: Cada cliente usa sus propias credenciales
2. **Escalable**: Agregar nuevos clientes es automático
3. **Seguro**: Credenciales encriptadas en la base de datos
4. **Aislado**: Un problema con las credenciales de un cliente no afecta a otros
5. **Flexible**: Cada cliente puede configurar solo las integraciones que necesita
6. **Mantenible**: El `.env` contiene solo configuración de la plataforma
7. **Profesional**: Sigue mejores prácticas de SaaS

---

## 🚀 Próximos Pasos para Implementar

1. ✅ Consolidar el `.env` (eliminar duplicados)
2. ✅ Crear la tabla `accounts` con columnas de credenciales encriptadas
3. ✅ Implementar funciones de encriptación/desencriptación
4. ✅ Crear endpoints para configurar integraciones
5. ✅ Modificar servicios para usar credenciales por cuenta
6. ✅ Implementar validación de credenciales al configurar
7. ✅ Crear interfaz en el dashboard para gestionar integraciones

---

## 📝 Notas Finales

- El `.env` es para **configuración de TU plataforma**
- Las credenciales de **cada cliente** van en la **base de datos encriptadas**
- Cada operación (llamada, webhook, etc.) usa las credenciales del cliente específico
- Este es el estándar para aplicaciones SaaS multi-tenant profesionales

---

## 📊 TABLA RESUMEN: ¿Dónde van las Credenciales?

| Servicio                          | ¿Dónde?          | Razón                                     |
| --------------------------------- | ---------------- | ----------------------------------------- |
| **Puertos** (CLIENT_PORT, etc.)   | ✅ `.env` raíz   | Configuración de la plataforma            |
| **Base de Datos** (DATABASE_URL)  | ✅ `.env` raíz   | Configuración de la plataforma            |
| **Admin** (ADMIN_EMAIL/PASSWORD)  | ✅ `.env` raíz   | Acceso al admin dashboard                 |
| **JWT** (JWT_SECRET)              | ✅ `.env` raíz   | Autenticación de la plataforma            |
| **Encriptación** (ENCRYPTION_KEY) | ✅ `.env` raíz   | Para encriptar credenciales de clientes   |
| **ElevenLabs** (API_KEY)          | ✅ `.env` raíz   | **La plataforma genera audio para todos** |
| **PayPal** (CLIENT_ID/SECRET)     | ✅ `.env` raíz   | **La plataforma cobra a los clientes**    |
| **Twilio** (SID/TOKEN)            | ❌ Base de datos | Cada cliente conecta el suyo              |
| **GoHighLevel** (API_KEY)         | ❌ Base de datos | Cada cliente conecta el suyo              |
| **Cal.com** (API_KEY)             | ❌ Base de datos | Cada cliente conecta el suyo              |

### 🎯 Regla Simple:

**¿El servicio es usado por LA PLATAFORMA para todos los clientes?**

- ✅ **SÍ** → Va en `.env` (ElevenLabs, PayPal)
- ❌ **NO** → Va en Base de Datos encriptado (Twilio, GHL, Cal.com)

---

**Fecha de creación**: 7 de Octubre, 2025
**Última actualización**: 7 de Octubre, 2025
