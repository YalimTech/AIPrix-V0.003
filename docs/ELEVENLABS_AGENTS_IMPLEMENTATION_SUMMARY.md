# 🎯 Resumen de Implementación de Agentes de ElevenLabs

## 📅 Fecha: Octubre 2025

Este documento resume todas las mejoras implementadas para que los agentes conversacionales de ElevenLabs funcionen correctamente según la documentación oficial.

## ✅ Funcionalidades Implementadas

### 1. **Configuración Completa de Agentes (conversation_config)**

La estructura de `conversation_config` ahora incluye todos los parámetros necesarios según la API oficial de ElevenLabs:

```typescript
conversationConfig: {
  // Configuración del agente
  agent: {
    prompt: string;           // Prompt del sistema
    first_message?: string;   // Primer mensaje del agente
    language: string;         // Idioma (ej: 'es', 'en')
  },

  // Configuración de voz (Text-to-Speech)
  tts: {
    voice_id: string;         // ID de la voz de ElevenLabs
    model_id: string;         // Modelo (eleven_turbo_v2_5)
    language: string;         // Idioma de la voz
    voice_settings: {
      stability: 0.8,         // Estabilidad de la voz
      similarity_boost: 0.85, // Similitud con la voz original
      style: 0.5,            // Estilo expresivo
      use_speaker_boost: true // Mejora para llamadas telefónicas
    }
  },

  // Configuración de reconocimiento de voz (Speech-to-Text)
  stt: {
    language: string;         // Idioma a reconocer
    model: 'nova-2-phonecall' // Modelo optimizado para llamadas
  },

  // Configuración del modelo de lenguaje
  llm: {
    model: 'gpt-4o-mini',    // Modelo de OpenAI
    temperature: 0.7,         // Creatividad
    max_tokens: 150          // Límite de tokens
  },

  // Detección de turnos de conversación
  turn_detection: {
    type: 'server_vad',      // Voice Activity Detection
    threshold: 0.5,          // Umbral de interrupción
    silence_duration_ms: 500 // Duración del silencio
  }
}
```

### 2. **Gestión de Números de Teléfono**

Nuevos endpoints para conectar números de Twilio con agentes de ElevenLabs:

- **POST** `/integrations/elevenlabs/agents/:agentId/phone-numbers` - Asignar número
- **GET** `/integrations/elevenlabs/agents/:agentId/phone-numbers` - Listar números
- **DELETE** `/integrations/elevenlabs/agents/:agentId/phone-numbers/:phoneNumberId` - Remover número

### 3. **Llamadas Inbound (Entrantes)**

- Webhook de Twilio redirige correctamente a ElevenLabs
- El agente maneja automáticamente la conversación
- Se registran transcripciones y grabaciones

```xml
<!-- TwiML generado para llamadas inbound -->
<Response>
  <Redirect method="POST">https://api.elevenlabs.io/v1/convai/webhook/twilio</Redirect>
</Response>
```

### 4. **Llamadas Outbound (Salientes)**

Nuevos endpoints para realizar llamadas:

- **POST** `/agents/:id/make-call` - Llamada individual
- **POST** `/integrations/elevenlabs/agents/:agentId/outbound-call` - Llamada directa
- **POST** `/integrations/elevenlabs/agents/:agentId/batch-calls` - Llamadas masivas

```javascript
// Ejemplo de llamada outbound
POST /agents/:id/make-call
{
  "toNumber": "+1234567890",
  "phoneNumberId": "optional-phone-id",
  "contactName": "Juan Pérez",
  "conversationData": {
    "purpose": "Seguimiento de venta",
    "productInterest": "Plan Premium"
  }
}
```

### 5. **Herramientas Integradas (Tools)**

Al crear agentes, se incluyen automáticamente las herramientas configuradas:

#### Calendar Booking

```javascript
{
  type: 'calendar_booking',
  name: 'Agendar cita',
  description: 'Permite agendar citas en el calendario',
  config: {
    provider: 'GHL',
    calendarId: 'calendar-id',
    timezone: 'America/Mexico_City'
  }
}
```

#### Call Transfer

```javascript
{
  type: 'call_transfer',
  name: 'Transferir llamada',
  description: 'Transfiere a un agente humano',
  config: {
    transferType: 'prompt',
    phoneNumber: '+1234567890',
    keywords: ['hablar con humano', 'agente real'],
    businessHours: true
  }
}
```

### 6. **Voces Optimizadas para Llamadas**

Configuración específica para que las voces suenen naturales en llamadas telefónicas:

```javascript
voice_settings: {
  stability: 0.8,          // Alta estabilidad para claridad
  similarity_boost: 0.85,  // Mantener características de la voz
  style: 0.5,             // Balance entre natural y claro
  use_speaker_boost: true  // Optimización para teléfono
}
```

### 7. **Manejo de Transcripciones y Grabaciones**

- Las transcripciones se guardan automáticamente en la base de datos
- Las grabaciones se almacenan con referencia en la tabla `calls`
- Webhooks procesan eventos de conversación en tiempo real

## 🚀 Cómo Usar

### 1. Crear un Agente

```bash
# 1. Crear agente local
POST /agents
{
  "name": "Mi Agente de Ventas",
  "systemPrompt": "Eres un agente de ventas profesional...",
  "language": "es",
  "calendarBookingEnabled": true,
  "calendarBookingId": "ghl-calendar-id"
}

# 2. Crear agente de ElevenLabs
POST /agents/:id/create-elevenlabs-agent
{
  "voiceId": "rachel",
  "language": "es",
  "conversationConfig": {
    "maxDuration": 300,
    "endCallPhrases": ["adiós", "hasta luego"],
    "interruptionThreshold": 0.5
  }
}
```

### 2. Asignar Número de Teléfono

```bash
POST /integrations/elevenlabs/agents/:agentId/phone-numbers
{
  "phoneNumberId": "phone-number-id"
}
```

### 3. Hacer Llamada

```bash
POST /agents/:id/make-call
{
  "toNumber": "+521234567890",
  "contactName": "Cliente Potencial"
}
```

## 📊 Arquitectura de Webhooks

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Twilio      │────▶│   Webhooks      │────▶│   ElevenLabs    │
│                 │     │   Controller    │     │     Agent       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌─────────────────┐              │
         └─────────────▶│   Webhooks      │◀─────────────┘
                        │    Service      │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Database     │
                        │   (PostgreSQL)  │
                        └─────────────────┘
```

## 🧪 Script de Prueba

Ejecuta el script de prueba completo:

```bash
node scripts/test-elevenlabs-full-flow.js
```

El script realiza:

1. Login con credenciales de prueba
2. Creación de agente local
3. Creación de agente de ElevenLabs
4. Asignación de número de teléfono
5. Llamada de prueba (si TEST_PHONE_NUMBER está configurado)
6. Verificación de estado

## 🔧 Variables de Entorno Necesarias

```env
# Base de datos
DATABASE_URL=postgresql://...

# ElevenLabs (guardado en base de datos por cliente)
# Cada cliente tiene su propia API key

# Twilio (guardado en base de datos por cliente)
# Cada cliente tiene sus propias credenciales

# URLs de la aplicación
APP_URL=https://tu-dominio.com
API_URL=https://api.tu-dominio.com

# Pruebas
TEST_ACCOUNT_EMAIL=test@test.com
TEST_ACCOUNT_PASSWORD=test123
TEST_PHONE_NUMBER=+1234567890
```

## 📝 Notas Importantes

1. **API Keys**: Las API keys de ElevenLabs se guardan en la base de datos por cliente, no en el .env
2. **Números de Teléfono**: Deben comprarse primero en Twilio antes de asignarlos
3. **Calendar Booking**: Requiere configuración previa de GoHighLevel
4. **Límites**: Configurar límites de duración y uso por cliente
5. **Monitoreo**: Revisar logs y métricas regularmente

## 🎯 Próximos Pasos Recomendados

1. **Configurar Producción**:
   - Configurar HTTPS y certificados SSL
   - Configurar webhooks públicos accesibles
   - Habilitar logs de producción

2. **Seguridad**:
   - Validar todos los webhooks entrantes
   - Implementar rate limiting
   - Encriptar datos sensibles

3. **Monitoreo**:
   - Implementar alertas de errores
   - Dashboard de métricas en tiempo real
   - Análisis de calidad de llamadas

4. **Optimización**:
   - Cache de configuraciones frecuentes
   - Optimizar queries de base de datos
   - Implementar queues para llamadas masivas

---

**Última actualización**: Octubre 2025
**Versión**: 1.0.0
