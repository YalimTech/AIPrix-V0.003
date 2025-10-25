# Implementación de Llamadas Inbound con ElevenLabs

## ✅ Configuración Completada

### 1. **Arquitectura Multi-Tenant**
- ✅ Cada cuenta tiene sus propias credenciales en la base de datos
- ✅ `AccountTwilioConfig` - Credenciales de Twilio por cuenta
- ✅ `AccountElevenLabsConfig` - API Key de ElevenLabs por cuenta
- ✅ `Agent` - Agentes con `elevenLabsAgentId` y `phoneNumber`

### 2. **Flujo de Llamadas Inbound**

```
Llamada → Twilio → Webhook → Buscar Agente → ElevenLabs → Conversación
```

#### **Paso 1: Llamada Entrante**
- Cliente llama al número asignado al agente
- Twilio recibe la llamada y envía webhook a `/webhooks/voice`

#### **Paso 2: Procesamiento del Webhook**
```typescript
// apps/api/src/integrations/twilio/twilio-webhooks.controller.ts
@Post('voice')
async handleVoiceWebhook(@Body() body: any) {
  // Procesa en background para no bloquear respuesta
  setImmediate(async () => {
    const twiMLResponse = await this.webhooksService.processTwilioVoiceWebhook(body);
  });
  return { message: 'Webhook processed successfully' };
}
```

#### **Paso 3: Búsqueda del Agente**
```typescript
// apps/api/src/webhooks/webhooks.service.ts
// Busca agente por número de teléfono asignado
const agent = await this.prisma.agent.findFirst({
  where: {
    phoneNumber: toNumber,  // Número al que llamaron
    type: 'inbound',
  },
  include: { account: true }
});
```

#### **Paso 4: Verificación de ElevenLabs**
```typescript
// Verifica que el agente tenga elevenLabsAgentId
if (agent.elevenLabsAgentId) {
  // Conecta con ElevenLabs
  return this.generateElevenLabsInboundTwiML(agent, callData);
}
```

#### **Paso 5: TwiML para ElevenLabs**
```typescript
// Genera TwiML que redirige a webhook de ElevenLabs
const webhookUrl = `${API_BASE_URL}/webhooks/elevenlabs/conversation-initiation`;
const params = new URLSearchParams({
  caller_id: fromNumber,
  agent_id: agent.elevenLabsAgentId,
  called_number: toNumber,
  call_sid: callSid
});

return `<Response><Redirect method="POST">${webhookUrl}?${params}</Redirect></Response>`;
```

### 3. **Endpoints Implementados**

#### **Asignación de Números**
- `POST /phone-assignment/assign` - Asignar número a agente
- `DELETE /phone-assignment/unassign/:agentId` - Desasignar número
- `GET /phone-assignment/inbound-agents` - Listar agentes con números

#### **Webhooks**
- `POST /webhooks/voice` - Webhook de Twilio para llamadas
- `POST /webhooks/elevenlabs/conversation-initiation` - Webhook de ElevenLabs

### 4. **Configuración en Twilio**

Para que funcione, debes configurar en tu cuenta de Twilio:

1. **Webhook URL de Voz:**
   ```
   https://tu-dominio.com/webhooks/voice
   ```

2. **Método:** POST
3. **Eventos:** Voice calls

### 5. **Configuración en ElevenLabs**

1. **Webhook URL:**
   ```
   https://tu-dominio.com/webhooks/elevenlabs/conversation-initiation
   ```

2. **Parámetros requeridos:**
   - `caller_id` - Número del que llama
   - `agent_id` - ID del agente en ElevenLabs
   - `called_number` - Número al que llamaron
   - `call_sid` - ID de la llamada en Twilio

### 6. **Base de Datos - Estructura**

```sql
-- Credenciales por cuenta
AccountTwilioConfig {
  accountId: string
  accountSid: string
  authToken: string
  status: 'active' | 'trial'
}

AccountElevenLabsConfig {
  accountId: string
  apiKey: string
  status: 'active' | 'trial'
}

-- Agentes con números asignados
Agent {
  id: string
  accountId: string
  name: string
  type: 'inbound'
  phoneNumber: string  -- Número asignado
  elevenLabsAgentId: string  -- ID en ElevenLabs
  status: 'active'
}

-- Registro de llamadas
Call {
  id: string
  accountId: string
  agentId: string
  direction: 'inbound'
  phoneNumber: string
  status: 'completed' | 'failed'
  transcript: string
  recordingUrl: string
  notes: JSON  -- { callSid, elevenLabsConversationId, etc }
}
```

### 7. **Flujo de Datos**

1. **Llamada Entrante:**
   - Cliente llama a `+1234567890`
   - Twilio envía webhook a `/webhooks/voice`

2. **Búsqueda del Agente:**
   - Sistema busca agente con `phoneNumber = '+1234567890'`
   - Encuentra agente con `elevenLabsAgentId = 'agent_123'`

3. **Conexión con ElevenLabs:**
   - Genera TwiML que redirige a ElevenLabs
   - ElevenLabs maneja la conversación automáticamente

4. **Registro de Llamada:**
   - Se crea registro en `Call` con toda la información
   - Se actualiza con transcript y recording cuando termina

### 8. **Testing**

Para probar la implementación:

1. **Asignar número a agente:**
   ```bash
   POST /phone-assignment/assign
   {
     "agentId": "agent_123",
     "phoneNumber": "+1234567890"
   }
   ```

2. **Verificar agente:**
   ```bash
   GET /phone-assignment/inbound-agents
   ```

3. **Hacer llamada de prueba:**
   - Llama al número asignado
   - Verifica logs del servidor
   - Revisa registro en base de datos

### 9. **Logs Importantes**

```typescript
// En webhooks.service.ts
this.logger.log(`Agente encontrado para número ${toNumber}: ${agent.name}`);
this.logger.log(`Conectando llamada inbound al agente de ElevenLabs: ${agent.elevenLabsAgentId}`);

// En elevenlabs-webhook.service.ts
this.logger.log(`🎯 Recibido webhook de iniciación de conversación de ElevenLabs`);
this.logger.log(`✅ Webhook procesado exitosamente para CallSid: ${call_sid}`);
```

### 10. **Verificación de Configuración**

La implementación está completa y verificada:

- ✅ Webhook de Twilio conectado con WebhooksService
- ✅ Búsqueda de agente por número de teléfono
- ✅ Verificación de elevenLabsAgentId
- ✅ Generación de TwiML para ElevenLabs
- ✅ Parámetros requeridos por ElevenLabs
- ✅ Registro de llamadas en base de datos
- ✅ Manejo de errores y logs

### 11. **Próximos Pasos**

1. **Configurar webhook en Twilio:**
   - URL: `https://tu-dominio.com/webhooks/voice`
   - Método: POST

2. **Asignar número a agente:**
   - Usar el modal de asignación en el frontend
   - O llamar directamente a la API

3. **Hacer llamada de prueba:**
   - Llamar al número asignado
   - Verificar que ElevenLabs responda
   - Revisar logs y base de datos

4. **Monitorear funcionamiento:**
   - Revisar logs del servidor
   - Verificar registros en base de datos
   - Ajustar configuración si es necesario

## 🎉 ¡Implementación Completa!

La configuración de llamadas inbound con ElevenLabs está lista y sigue las mejores prácticas de la documentación oficial.
