# 🚀 **DOCUMENTACIÓN COMPLETA DE LA API - PRIXAGENT**

## 📋 **ÍNDICE**

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints Principales](#endpoints-principales)
4. [Integraciones](#integraciones)
5. [Webhooks](#webhooks)
6. [Rate Limiting](#rate-limiting)
7. [Códigos de Error](#códigos-de-error)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [SDKs y Librerías](#sdks-y-librerías)

---

## 🎯 **INTRODUCCIÓN**

PrixAgent es una plataforma SaaS completa para la gestión de agentes de voz AI con integraciones avanzadas. Esta API REST proporciona acceso completo a todas las funcionalidades del sistema.

### **Base URL**

```
Producción: https://api.prixagent.com/v1
Desarrollo: https://dev-api.prixagent.com/v1
```

### **Formato de Respuesta**

Todas las respuestas siguen el formato JSON estándar:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2025-01-10T10:30:00Z",
  "requestId": "req_123456789"
}
```

---

## 🔐 **AUTENTICACIÓN**

### **JWT Authentication**

```bash
Authorization: Bearer <jwt_token>
```

### **API Key Authentication**

```bash
X-API-Key: <api_key>
```

### **Obtener Token**

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password_seguro"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "usuario@ejemplo.com",
      "role": "admin"
    }
  }
}
```

---

## 🎯 **ENDPOINTS PRINCIPALES**

### **👥 Usuarios y Autenticación**

#### **POST /auth/login**

Iniciar sesión de usuario

```json
{
  "email": "string",
  "password": "string"
}
```

#### **POST /auth/register**

Registrar nuevo usuario

```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "accountId": "string"
}
```

#### **POST /auth/refresh**

Renovar token de acceso

```json
{
  "refreshToken": "string"
}
```

#### **GET /users/profile**

Obtener perfil del usuario actual

#### **PUT /users/profile**

Actualizar perfil del usuario

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

### **🤖 Agentes**

#### **GET /agents**

Listar todos los agentes del usuario

```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "agent_123",
        "name": "Agente de Ventas",
        "description": "Agente especializado en ventas",
        "voiceId": "voice_456",
        "modelId": "model_789",
        "status": "active",
        "createdAt": "2025-01-10T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

#### **POST /agents**

Crear nuevo agente

```json
{
  "name": "string",
  "description": "string",
  "voiceId": "string",
  "modelId": "string",
  "accountId": "string",
  "configuration": {
    "temperature": 0.7,
    "maxTokens": 150,
    "systemPrompt": "Eres un asistente de ventas profesional..."
  }
}
```

#### **GET /agents/:id**

Obtener agente específico

#### **PUT /agents/:id**

Actualizar agente

```json
{
  "name": "string",
  "description": "string",
  "configuration": {
    "temperature": 0.8
  }
}
```

#### **DELETE /agents/:id**

Eliminar agente

### **📞 Llamadas**

#### **GET /calls**

Listar llamadas

```json
{
  "success": true,
  "data": {
    "calls": [
      {
        "id": "call_123",
        "agentId": "agent_456",
        "contactId": "contact_789",
        "status": "completed",
        "duration": 180,
        "direction": "outbound",
        "startedAt": "2025-01-10T10:30:00Z",
        "endedAt": "2025-01-10T10:33:00Z",
        "transcript": "Hola, soy un agente de ventas...",
        "summary": "Llamada de ventas exitosa"
      }
    ]
  }
}
```

#### **POST /calls**

Iniciar nueva llamada

```json
{
  "agentId": "string",
  "contactId": "string",
  "direction": "outbound",
  "phoneNumber": "+1234567890"
}
```

#### **GET /calls/:id**

Obtener llamada específica

#### **PUT /calls/:id**

Actualizar llamada

```json
{
  "status": "completed",
  "duration": 180,
  "transcript": "string",
  "summary": "string"
}
```

### **👤 Contactos**

#### **GET /contacts**

Listar contactos

```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_123",
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan@ejemplo.com",
        "phone": "+1234567890",
        "tags": ["cliente", "vip"],
        "customFields": {
          "company": "Empresa ABC",
          "position": "CEO"
        },
        "createdAt": "2025-01-10T10:30:00Z"
      }
    ]
  }
}
```

#### **POST /contacts**

Crear nuevo contacto

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "accountId": "string",
  "tags": ["string"],
  "customFields": {
    "company": "string",
    "position": "string"
  }
}
```

#### **GET /contacts/:id**

Obtener contacto específico

#### **PUT /contacts/:id**

Actualizar contacto

#### **DELETE /contacts/:id**

Eliminar contacto

### **🏢 Accounts**

#### **GET /accounts**

Listar accounts del usuario

#### **POST /accounts**

Crear nuevo account

```json
{
  "name": "string",
  "slug": "string",
  "email": "string",
  "plan": "basic"
}
```

#### **GET /accounts/:id**

Obtener account específico

#### **PUT /accounts/:id**

Actualizar account

---

## 🔗 **INTEGRACIONES**

### **GoHighLevel (GHL)**

#### **GET /integrations/ghl/status**

Verificar estado de la integración GHL

#### **POST /integrations/ghl/connect**

Conectar con GoHighLevel

```json
{
  "apiKey": "string",
  "locationId": "string"
}
```

#### **GET /integrations/ghl/contacts**

Sincronizar contactos desde GHL

#### **POST /integrations/ghl/webhook**

Configurar webhook de GHL

```json
{
  "url": "string",
  "events": ["contact.created", "contact.updated"]
}
```

### **ElevenLabs**

#### **GET /integrations/elevenlabs/voices**

Listar voces disponibles

#### **POST /integrations/elevenlabs/synthesize**

Sintetizar audio

```json
{
  "text": "string",
  "voiceId": "string",
  "modelId": "string"
}
```

#### **GET /integrations/elevenlabs/agents**

Listar agentes de ElevenLabs

### **Twilio**

#### **GET /integrations/twilio/numbers**

Listar números de teléfono

#### **POST /integrations/twilio/call**

Realizar llamada

```json
{
  "to": "+1234567890",
  "from": "+1987654321",
  "agentId": "agent_123"
}
```

### **PayPal**

#### **POST /integrations/paypal/create-payment**

Crear pago

```json
{
  "amount": 99.99,
  "currency": "USD",
  "description": "Plan Premium"
}
```

#### **POST /integrations/paypal/execute-payment**

Ejecutar pago

```json
{
  "paymentId": "string",
  "payerId": "string"
}
```

---

## 🔔 **WEBHOOKS**

### **Configuración**

Los webhooks permiten recibir notificaciones en tiempo real sobre eventos del sistema.

#### **POST /webhooks**

Crear webhook

```json
{
  "url": "https://tu-servidor.com/webhook",
  "events": ["call.completed", "contact.created", "agent.updated"],
  "secret": "tu_secreto_webhook"
}
```

### **Eventos Disponibles**

#### **Llamadas**

- `call.started` - Llamada iniciada
- `call.completed` - Llamada completada
- `call.failed` - Llamada fallida

#### **Contactos**

- `contact.created` - Contacto creado
- `contact.updated` - Contacto actualizado
- `contact.deleted` - Contacto eliminado

#### **Agentes**

- `agent.created` - Agente creado
- `agent.updated` - Agente actualizado
- `agent.deleted` - Agente eliminado

### **Estructura del Webhook**

```json
{
  "event": "call.completed",
  "data": {
    "id": "call_123",
    "agentId": "agent_456",
    "contactId": "contact_789",
    "status": "completed",
    "duration": 180
  },
  "timestamp": "2025-01-10T10:33:00Z",
  "signature": "sha256=abc123..."
}
```

---

## ⚡ **RATE LIMITING**

### **Límites por Usuario**

- **Free Plan:** 100 requests/hour
- **Basic Plan:** 1,000 requests/hour
- **Premium Plan:** 10,000 requests/hour
- **Enterprise:** Sin límites

### **Headers de Rate Limiting**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641900000
```

### **Límites Específicos**

- **Llamadas:** 50/hour por usuario
- **Síntesis de audio:** 100/hour por usuario
- **Webhooks:** 10/second por webhook

---

## ❌ **CÓDIGOS DE ERROR**

### **Códigos HTTP Estándar**

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### **Códigos de Error Personalizados**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_AGENT_CONFIG",
    "message": "Configuración del agente inválida",
    "details": {
      "field": "temperature",
      "expected": "number between 0 and 1",
      "received": "2.5"
    }
  }
}
```

### **Códigos de Error Comunes**

- `INVALID_CREDENTIALS` - Credenciales inválidas
- `AGENT_NOT_FOUND` - Agente no encontrado
- `CONTACT_NOT_FOUND` - Contacto no encontrado
- `INTEGRATION_ERROR` - Error en integración
- `RATE_LIMIT_EXCEEDED` - Límite de rate excedido
- `WEBHOOK_VERIFICATION_FAILED` - Verificación de webhook fallida

---

## 💡 **EJEMPLOS DE USO**

### **Flujo Completo: Crear Agente y Realizar Llamada**

#### **1. Crear Agente**

```bash
curl -X POST https://api.prixagent.com/v1/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente de Ventas",
    "description": "Especializado en ventas de software",
    "voiceId": "voice_123",
    "modelId": "model_456",
    "configuration": {
      "temperature": 0.7,
      "systemPrompt": "Eres un agente de ventas profesional..."
    }
  }'
```

#### **2. Crear Contacto**

```bash
curl -X POST https://api.prixagent.com/v1/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@empresa.com",
    "phone": "+1234567890"
  }'
```

#### **3. Realizar Llamada**

```bash
curl -X POST https://api.prixagent.com/v1/calls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_123",
    "contactId": "contact_456",
    "direction": "outbound"
  }'
```

### **Integración con Webhooks**

#### **Configurar Webhook**

```bash
curl -X POST https://api.prixagent.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tu-servidor.com/webhook",
    "events": ["call.completed"],
    "secret": "mi_secreto_seguro"
  }'
```

#### **Procesar Webhook en tu Servidor**

```javascript
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-prixagent-signature"];
  const payload = req.body;

  // Verificar firma
  if (!verifyWebhookSignature(payload, signature, "mi_secreto_seguro")) {
    return res.status(401).send("Unauthorized");
  }

  // Procesar evento
  if (payload.event === "call.completed") {
    console.log("Llamada completada:", payload.data);
    // Tu lógica aquí
  }

  res.status(200).send("OK");
});
```

---

## 📚 **SDKs Y LIBRERÍAS**

### **JavaScript/TypeScript**

```bash
npm install @prixagent/sdk
```

```javascript
import { PrixAgent } from "@prixagent/sdk";

const client = new PrixAgent({
  apiKey: "tu_api_key",
  baseURL: "https://api.prixagent.com/v1",
});

// Crear agente
const agent = await client.agents.create({
  name: "Mi Agente",
  description: "Descripción del agente",
});

// Realizar llamada
const call = await client.calls.create({
  agentId: agent.id,
  contactId: "contact_123",
});
```

### **Python**

```bash
pip install prixagent-sdk
```

```python
from prixagent import PrixAgent

client = PrixAgent(api_key='tu_api_key')

# Crear agente
agent = client.agents.create({
    'name': 'Mi Agente',
    'description': 'Descripción del agente'
})

# Realizar llamada
call = client.calls.create({
    'agentId': agent.id,
    'contactId': 'contact_123'
})
```

### **PHP**

```bash
composer require prixagent/sdk
```

```php
<?php
use PrixAgent\Client;

$client = new Client('tu_api_key');

// Crear agente
$agent = $client->agents->create([
    'name' => 'Mi Agente',
    'description' => 'Descripción del agente'
]);

// Realizar llamada
$call = $client->calls->create([
    'agentId' => $agent->id,
    'contactId' => 'contact_123'
]);
?>
```

---

## 🔧 **CONFIGURACIÓN AVANZADA**

### **Variables de Entorno**

```bash
# API Configuration
PRIXAGENT_API_KEY=tu_api_key
PRIXAGENT_BASE_URL=https://api.prixagent.com/v1

# Integrations
ELEVENLABS_API_KEY=tu_elevenlabs_key
GHL_API_KEY=tu_ghl_key
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token

# Webhooks
WEBHOOK_SECRET=tu_webhook_secret
```

### **Configuración de Timeout**

```javascript
const client = new PrixAgent({
  apiKey: "tu_api_key",
  timeout: 30000, // 30 segundos
  retries: 3,
});
```

### **Logging y Debugging**

```javascript
const client = new PrixAgent({
  apiKey: "tu_api_key",
  debug: true,
  logLevel: "info",
});
```

---

## 📞 **SOPORTE**

### **Documentación Adicional**

- [Guía de Desarrollador](./DEVELOPER_GUIDE.md)
- [Guía de Integraciones](./INTEGRATIONS_GUIDE.md)
- [Ejemplos de Código](./CODE_EXAMPLES.md)

### **Contacto**

- **Email:** dev@prixagent.com
- **Discord:** [Servidor de Desarrolladores](https://discord.gg/prixagent)
- **GitHub:** [Issues](https://github.com/prixagent/issues)

### **Estado del Servicio**

- **Status Page:** https://status.prixagent.com
- **Uptime:** 99.9%
- **SLA:** 99.5%

---

**Última actualización:** 10 de Enero, 2025  
**Versión de la API:** v1.0.0
