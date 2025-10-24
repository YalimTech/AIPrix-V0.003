# 🔗 **GUÍA COMPLETA DE INTEGRACIONES - PRIXAGENT**

## 📋 **ÍNDICE**

1. [Introducción](#introducción)
2. [ElevenLabs Integration](#elevenlabs-integration)
3. [GoHighLevel Integration](#gohighlevel-integration)
4. [Twilio Integration](#twilio-integration)
5. [PayPal Integration](#paypal-integration)
6. [Cal.com Integration](#calcom-integration)
7. [N8N Integration](#n8n-integration)
8. [Webhooks](#webhooks)
9. [Troubleshooting](#troubleshooting)
10. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 **INTRODUCCIÓN**

PrixAgent está diseñado para integrarse perfectamente con las mejores herramientas del mercado. Esta guía proporciona instrucciones detalladas para configurar y utilizar todas las integraciones disponibles.

### **Integraciones Disponibles**

- **🎙️ ElevenLabs** - Síntesis de voz y agentes conversacionales
- **📊 GoHighLevel** - CRM y automatización de marketing
- **📞 Twilio** - Comunicaciones telefónicas
- **💳 PayPal** - Procesamiento de pagos
- **📅 Cal.com** - Gestión de citas
- **⚡ N8N** - Automatización de workflows

---

## 🎙️ **ELEVENLABS INTEGRATION**

### **Configuración Inicial**

#### **1. Obtener API Key**

```bash
# Registrar en ElevenLabs
https://elevenlabs.io/sign-up

# Obtener API Key
https://elevenlabs.io/app/settings/api-keys
```

#### **2. Configurar Variables de Entorno**

```bash
# .env
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret
```

#### **3. Verificar Conexión**

```bash
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "Accept: application/json" \
  -H "xi-api-key: YOUR_API_KEY"
```

### **Funcionalidades Disponibles**

#### **Síntesis de Voz**

```typescript
// Sintetizar texto a audio
const audio = await elevenLabsService.synthesizeAudio({
  text: "Hola, soy tu asistente de voz",
  voiceId: "voice_123",
  modelId: "eleven_multilingual_v2",
  voiceSettings: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
  },
});
```

#### **Agentes Conversacionales**

```typescript
// Crear agente conversacional
const agent = await elevenLabsService.createAgent({
  name: "Agente de Ventas",
  description: "Especializado en ventas de software",
  voiceId: "voice_456",
  modelId: "eleven_multilingual_v2",
  instructions: "Eres un agente de ventas profesional...",
  knowledgeBase: [
    {
      title: "Productos",
      content: "Información sobre nuestros productos...",
    },
  ],
});
```

#### **Conversaciones en Tiempo Real**

```typescript
// Iniciar conversación
const conversation = await elevenLabsService.startConversation({
  agentId: "agent_123",
  userId: "user_456",
  context: {
    customerName: "Juan Pérez",
    company: "Empresa ABC",
  },
});

// Enviar mensaje
const response = await elevenLabsService.sendMessage({
  conversationId: conversation.id,
  message: "Hola, me interesa conocer más sobre sus productos",
  audio: true,
});
```

### **Webhooks de ElevenLabs**

```typescript
// Configurar webhook
const webhook = await elevenLabsService.configureWebhook({
  url: "https://api.prixagent.com/webhooks/elevenlabs",
  events: [
    "conversation.started",
    "conversation.ended",
    "message.received",
    "message.sent"
  ],
  secret: "your_webhook_secret"
});

// Procesar webhook
@Post('/webhooks/elevenlabs')
async handleElevenLabsWebhook(@Body() payload: any, @Headers() headers: any) {
  const signature = headers['x-elevenlabs-signature'];

  if (!this.elevenLabsService.verifyWebhookSignature(payload, signature)) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  switch (payload.event) {
    case 'conversation.started':
      await this.handleConversationStarted(payload.data);
      break;
    case 'conversation.ended':
      await this.handleConversationEnded(payload.data);
      break;
    case 'message.received':
      await this.handleMessageReceived(payload.data);
      break;
  }
}
```

### **Mejores Prácticas**

- **Cache de voces:** Cachear listas de voces para mejor performance
- **Rate limiting:** Respetar límites de API (10 requests/segundo)
- **Error handling:** Implementar retry logic para errores temporales
- **Audio quality:** Usar formatos optimizados (MP3 128kbps)

---

## 📊 **GOHIGHLEVEL INTEGRATION**

### **Configuración Inicial**

#### **1. Obtener Credenciales**

```bash
# Registrar en GoHighLevel
https://app.gohighlevel.com/signup

# Obtener API Key
https://app.gohighlevel.com/settings/api-keys

# Obtener Location ID
https://app.gohighlevel.com/settings/locations
```

#### **2. Configurar Variables de Entorno**

```bash
# .env
GHL_API_KEY=your_ghl_api_key
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=v2
GHL_CLIENT_ID=your_client_id
GHL_CLIENT_SECRET=your_client_secret
GHL_REDIRECT_URI=https://api.prixagent.com/ghl/oauth/callback
GHL_WEBHOOK_SECRET=your_webhook_secret
```

#### **3. Configurar OAuth 2.0**

```typescript
// Obtener URL de autorización
const authUrl = await ghlService.getAuthorizationUrl({
  clientId: process.env.GHL_CLIENT_ID,
  redirectUri: process.env.GHL_REDIRECT_URI,
  scope: ['contacts.read', 'contacts.write', 'opportunities.read', 'opportunities.write'],
  state: 'random_state_string'
});

// Procesar callback OAuth
@Get('/ghl/oauth/callback')
async handleGhlCallback(@Query() query: any) {
  const { code, state } = query;

  const tokens = await ghlService.exchangeCodeForTokens({
    code,
    clientId: process.env.GHL_CLIENT_ID,
    clientSecret: process.env.GHL_CLIENT_SECRET,
    redirectUri: process.env.GHL_REDIRECT_URI
  });

  // Guardar tokens en base de datos
  await this.ghlService.saveTokens(tokens);
}
```

### **Funcionalidades Disponibles**

#### **Gestión de Contactos**

```typescript
// Obtener contactos
const contacts = await ghlService.getContacts({
  locationId: "location_123",
  limit: 50,
  page: 1,
});

// Crear contacto
const contact = await ghlService.createContact({
  locationId: "location_123",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@empresa.com",
  phone: "+1234567890",
  customFields: {
    company: "Empresa ABC",
    position: "CEO",
  },
});

// Actualizar contacto
const updatedContact = await ghlService.updateContact({
  contactId: "contact_456",
  locationId: "location_123",
  data: {
    tags: ["cliente", "vip"],
    customFields: {
      lastCallDate: new Date().toISOString(),
    },
  },
});
```

#### **Gestión de Oportunidades**

```typescript
// Crear oportunidad
const opportunity = await ghlService.createOpportunity({
  locationId: "location_123",
  contactId: "contact_456",
  name: "Venta de Software Premium",
  status: "new",
  monetaryValue: 5000,
  pipelineId: "pipeline_789",
  pipelineStageId: "stage_101",
});

// Actualizar oportunidad
const updatedOpportunity = await ghlService.updateOpportunity({
  opportunityId: "opportunity_123",
  locationId: "location_123",
  data: {
    status: "won",
    closedDate: new Date().toISOString(),
  },
});
```

#### **Automatizaciones**

```typescript
// Crear automatización
const automation = await ghlService.createAutomation({
  locationId: "location_123",
  name: "Seguimiento Post-Llamada",
  trigger: "contact.updated",
  conditions: [
    {
      field: "lastCallDate",
      operator: "is_not_empty",
    },
  ],
  actions: [
    {
      type: "send_email",
      templateId: "template_123",
      delay: 3600, // 1 hora
    },
  ],
});
```

### **Webhooks de GoHighLevel**

```typescript
// Configurar webhook
const webhook = await ghlService.configureWebhook({
  locationId: 'location_123',
  url: 'https://api.prixagent.com/webhooks/ghl',
  events: [
    'ContactCreate',
    'ContactUpdate',
    'OpportunityCreate',
    'OpportunityUpdate'
  ]
});

// Procesar webhook
@Post('/webhooks/ghl')
async handleGhlWebhook(@Body() payload: any, @Headers() headers: any) {
  const signature = headers['x-ghl-signature'];

  if (!this.ghlService.verifyWebhookSignature(payload, signature)) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  switch (payload.type) {
    case 'ContactCreate':
      await this.handleContactCreated(payload.payload);
      break;
    case 'ContactUpdate':
      await this.handleContactUpdated(payload.payload);
      break;
    case 'OpportunityCreate':
      await this.handleOpportunityCreated(payload.payload);
      break;
  }
}
```

### **Rate Limiting**

```typescript
// Configuración de rate limiting
const rateLimitConfig = {
  perMinute: 60,
  perHour: 1000,
  burst: 10,
};

// Implementación en servicio
@Injectable()
export class GHLService {
  private rateLimiter = new RateLimiter(rateLimitConfig);

  async makeRequest(endpoint: string, data: any) {
    await this.rateLimiter.checkLimit();
    return this.httpService.post(endpoint, data).toPromise();
  }
}
```

---

## 📞 **TWILIO INTEGRATION**

### **Configuración Inicial**

#### **1. Obtener Credenciales**

```bash
# Registrar en Twilio
https://www.twilio.com/try-twilio

# Obtener Account SID y Auth Token
https://console.twilio.com/us1/account/settings

# Comprar número de teléfono
https://console.twilio.com/us1/develop/phone-numbers/manage/search
```

#### **2. Configurar Variables de Entorno**

```bash
# .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_SECRET=your_webhook_secret
```

### **Funcionalidades Disponibles**

#### **Realizar Llamadas**

```typescript
// Iniciar llamada
const call = await twilioService.makeCall({
  to: '+1234567890',
  from: process.env.TWILIO_PHONE_NUMBER,
  url: 'https://api.prixagent.com/twilio/voice',
  method: 'POST',
  statusCallback: 'https://api.prixagent.com/twilio/status',
  statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
});

// Configurar TwiML para la llamada
@Post('/twilio/voice')
async handleVoiceRequest(@Body() body: any) {
  const twiml = new Twilio.twiml.VoiceResponse();

  // Conectar con agente de IA
  const dial = twiml.dial();
  dial.conference('agent-conference', {
    startConferenceOnEnter: true,
    endConferenceOnExit: true
  });

  return twiml.toString();
}
```

#### **SMS**

```typescript
// Enviar SMS
const message = await twilioService.sendSMS({
  to: '+1234567890',
  from: process.env.TWILIO_PHONE_NUMBER,
  body: 'Hola, tu llamada ha sido programada para las 2:00 PM'
});

// Recibir SMS
@Post('/twilio/sms')
async handleSMS(@Body() body: any) {
  const { From, To, Body } = body;

  // Procesar mensaje SMS
  const response = await this.processSMSMessage({
    from: From,
    to: To,
    body: Body
  });

  // Responder con TwiML
  const twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(response);

  return twiml.toString();
}
```

#### **WhatsApp**

```typescript
// Enviar mensaje de WhatsApp
const message = await twilioService.sendWhatsApp({
  to: 'whatsapp:+1234567890',
  from: 'whatsapp:+1987654321',
  body: 'Hola, ¿cómo puedo ayudarte hoy?'
});

// Recibir mensaje de WhatsApp
@Post('/twilio/whatsapp')
async handleWhatsApp(@Body() body: any) {
  const { From, To, Body } = body;

  // Procesar mensaje de WhatsApp
  const response = await this.processWhatsAppMessage({
    from: From,
    to: To,
    body: Body
  });

  return response;
}
```

### **Webhooks de Twilio**

```typescript
// Procesar status callback
@Post('/twilio/status')
async handleStatusCallback(@Body() body: any) {
  const { CallSid, CallStatus, Duration, From, To } = body;

  // Actualizar estado de la llamada en base de datos
  await this.callsService.updateCallStatus({
    callSid: CallSid,
    status: CallStatus,
    duration: Duration ? parseInt(Duration) : 0,
    from: From,
    to: To
  });

  // Enviar notificación si es necesario
  if (CallStatus === 'completed') {
    await this.notificationsService.sendCallCompletedNotification({
      callSid: CallSid,
      duration: Duration
    });
  }
}
```

---

## 💳 **PAYPAL INTEGRATION**

### **Configuración Inicial**

#### **1. Obtener Credenciales**

```bash
# Registrar en PayPal Developer
https://developer.paypal.com/

# Crear aplicación
https://developer.paypal.com/developer/applications/

# Obtener Client ID y Secret
```

#### **2. Configurar Variables de Entorno**

```bash
# .env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_BASE_URL=https://api.sandbox.paypal.com  # Sandbox
# PAYPAL_BASE_URL=https://api.paypal.com        # Producción
PAYPAL_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_SANDBOX_MODE=true
```

### **Funcionalidades Disponibles**

#### **Crear Pago**

```typescript
// Crear pago
const payment = await paypalService.createPayment({
  intent: "sale",
  payer: {
    payment_method: "paypal",
  },
  transactions: [
    {
      amount: {
        total: "99.99",
        currency: "USD",
      },
      description: "Plan Premium PrixAgent",
      item_list: {
        items: [
          {
            name: "Plan Premium",
            sku: "premium-plan",
            price: "99.99",
            currency: "USD",
            quantity: 1,
          },
        ],
      },
    },
  ],
  redirect_urls: {
    return_url: "https://app.prixagent.com/payment/success",
    cancel_url: "https://app.prixagent.com/payment/cancel",
  },
});

// Ejecutar pago
const executedPayment = await paypalService.executePayment({
  paymentId: payment.id,
  payerId: "payer_123",
});
```

#### **Suscripciones**

```typescript
// Crear plan de suscripción
const billingPlan = await paypalService.createBillingPlan({
  name: "Plan Premium Mensual",
  description: "Suscripción mensual al plan premium",
  type: "INFINITE",
  payment_definitions: [
    {
      name: "Premium Plan",
      type: "REGULAR",
      frequency: "Month",
      frequency_interval: "1",
      cycles: "0",
      amount: {
        currency: "USD",
        value: "99.99",
      },
    },
  ],
  merchant_preferences: {
    auto_bill_amount: "YES",
    initial_fail_amount_action: "CONTINUE",
    max_fail_attempts: "3",
  },
});

// Activar plan
await paypalService.activateBillingPlan(billingPlan.id);

// Crear suscripción
const subscription = await paypalService.createSubscription({
  planId: billingPlan.id,
  startDate: new Date().toISOString(),
});
```

#### **Webhooks de PayPal**

```typescript
// Procesar webhook
@Post('/webhooks/paypal')
async handlePayPalWebhook(@Body() body: any, @Headers() headers: any) {
  const signature = headers['paypal-transmission-sig'];

  if (!this.paypalService.verifyWebhookSignature(body, signature)) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  switch (body.event_type) {
    case 'PAYMENT.SALE.COMPLETED':
      await this.handlePaymentCompleted(body.resource);
      break;
    case 'BILLING.SUBSCRIPTION.CREATED':
      await this.handleSubscriptionCreated(body.resource);
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await this.handleSubscriptionCancelled(body.resource);
      break;
  }
}
```

---

## 📅 **CAL.COM INTEGRATION**

### **Configuración Inicial**

#### **1. Obtener API Key**

```bash
# Registrar en Cal.com
https://cal.com/signup

# Obtener API Key
https://cal.com/settings/developer
```

#### **2. Configurar Variables de Entorno**

```bash
# .env
CALCOM_API_KEY=your_api_key
CALCOM_BASE_URL=https://api.cal.com/v1
CALCOM_WEBHOOK_SECRET=your_webhook_secret
```

### **Funcionalidades Disponibles**

#### **Gestión de Eventos**

```typescript
// Crear evento
const event = await calcomService.createEvent({
  title: "Consulta con Agente IA",
  description: "Reunión para discutir implementación",
  startTime: new Date("2025-01-15T14:00:00Z"),
  endTime: new Date("2025-01-15T15:00:00Z"),
  attendees: [
    {
      email: "cliente@empresa.com",
      name: "Juan Pérez",
    },
  ],
});

// Obtener eventos
const events = await calcomService.getEvents({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
});
```

#### **Integración con Agentes**

```typescript
// Programar llamada con agente
const scheduledCall = await calcomService.scheduleAgentCall({
  agentId: 'agent_123',
  contactId: 'contact_456',
  scheduledTime: new Date('2025-01-15T14:00:00Z'),
  duration: 30 // minutos
});

// Procesar evento de calendario
@Post('/webhooks/calcom')
async handleCalComWebhook(@Body() payload: any) {
  switch (payload.type) {
    case 'BOOKING_CREATED':
      await this.handleBookingCreated(payload.payload);
      break;
    case 'BOOKING_CANCELLED':
      await this.handleBookingCancelled(payload.payload);
      break;
  }
}
```

---

## ⚡ **N8N INTEGRATION**

### **Configuración Inicial**

#### **1. Configurar N8N**

```bash
# Instalar N8N
npm install -g n8n

# Iniciar N8N
n8n start

# Acceder a la interfaz
http://localhost:5678
```

#### **2. Configurar Variables de Entorno**

```bash
# .env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### **Funcionalidades Disponibles**

#### **Crear Workflow**

```typescript
// Crear workflow automatizado
const workflow = await n8nService.createWorkflow({
  name: "Seguimiento Post-Llamada",
  nodes: [
    {
      name: "Trigger",
      type: "webhook",
      parameters: {
        path: "post-call-followup",
        httpMethod: "POST",
      },
    },
    {
      name: "Enviar Email",
      type: "email",
      parameters: {
        to: "{{$json.contact.email}}",
        subject: "Gracias por tu llamada",
        body: "Hola {{$json.contact.name}}, gracias por tu llamada...",
      },
    },
    {
      name: "Actualizar CRM",
      type: "httpRequest",
      parameters: {
        url: "https://api.gohighlevel.com/v1/contacts/{{$json.contact.id}}",
        method: "PUT",
        headers: {
          Authorization: "Bearer {{$json.ghl_token}}",
        },
        body: {
          customFields: {
            lastCallDate: "{{$now}}",
          },
        },
      },
    },
  ],
});
```

#### **Ejecutar Workflow**

```typescript
// Ejecutar workflow manualmente
const execution = await n8nService.executeWorkflow({
  workflowId: "workflow_123",
  data: {
    contact: {
      id: "contact_456",
      name: "Juan Pérez",
      email: "juan@empresa.com",
    },
    call: {
      duration: 180,
      summary: "Llamada exitosa sobre productos",
    },
  },
});
```

---

## 🔔 **WEBHOOKS**

### **Configuración General**

#### **Crear Webhook**

```typescript
// Crear webhook
const webhook = await webhooksService.createWebhook({
  name: "Actualización de Contacto",
  url: "https://api.externa.com/webhook",
  events: ["contact.created", "contact.updated"],
  secret: "webhook_secret",
  headers: {
    Authorization: "Bearer external_api_token",
    "Content-Type": "application/json",
  },
  retryPolicy: {
    maxRetries: 3,
    retryDelay: 5000, // 5 segundos
  },
});
```

#### **Procesar Webhook**

```typescript
// Procesar webhook entrante
@Post('/webhooks/:webhookId')
async handleWebhook(
  @Param('webhookId') webhookId: string,
  @Body() payload: any,
  @Headers() headers: any
) {
  // Verificar webhook
  const webhook = await this.webhooksService.getWebhook(webhookId);
  if (!webhook) {
    throw new NotFoundException('Webhook not found');
  }

  // Verificar firma
  const signature = headers['x-webhook-signature'];
  if (!this.webhooksService.verifySignature(payload, signature, webhook.secret)) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // Procesar evento
  await this.processWebhookEvent(webhook, payload);

  return { success: true };
}
```

### **Eventos Disponibles**

```typescript
const WEBHOOK_EVENTS = {
  // Agentes
  "agent.created": "Agente creado",
  "agent.updated": "Agente actualizado",
  "agent.deleted": "Agente eliminado",

  // Llamadas
  "call.started": "Llamada iniciada",
  "call.completed": "Llamada completada",
  "call.failed": "Llamada fallida",

  // Contactos
  "contact.created": "Contacto creado",
  "contact.updated": "Contacto actualizado",
  "contact.deleted": "Contacto eliminado",

  // Pagos
  "payment.completed": "Pago completado",
  "payment.failed": "Pago fallido",
  "subscription.created": "Suscripción creada",
  "subscription.cancelled": "Suscripción cancelada",
};
```

---

## 🔧 **TROUBLESHOOTING**

### **Problemas Comunes**

#### **1. Error de Autenticación**

```bash
# Verificar API keys
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.elevenlabs.io/v1/voices

# Verificar variables de entorno
echo $ELEVENLABS_API_KEY
echo $GHL_API_KEY
```

#### **2. Error de Rate Limiting**

```typescript
// Implementar retry con backoff
async function makeRequestWithRetry(
  requestFn: () => Promise<any>,
  maxRetries = 3,
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

#### **3. Error de Webhook**

```typescript
// Verificar configuración de webhook
const webhook = await integrationService.getWebhook(webhookId);
console.log('Webhook URL:', webhook.url);
console.log('Webhook Events:', webhook.events);
console.log('Webhook Secret:', webhook.secret);

// Verificar conectividad
curl -X POST https://api.prixagent.com/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### **Logs Útiles**

```bash
# Ver logs de integraciones
docker-compose logs -f api | grep "Integration"

# Ver logs específicos de ElevenLabs
docker-compose logs -f api | grep "ElevenLabs"

# Ver logs de webhooks
docker-compose logs -f api | grep "Webhook"
```

---

## 📋 **MEJORES PRÁCTICAS**

### **1. Manejo de Errores**

```typescript
// ✅ Bueno: Manejo estructurado
try {
  const result = await integrationService.makeRequest();
  return { success: true, data: result };
} catch (error) {
  this.logger.error("Integration error:", {
    service: "elevenlabs",
    error: error.message,
    stack: error.stack,
  });

  if (error.status === 401) {
    throw new UnauthorizedException("Invalid API credentials");
  } else if (error.status === 429) {
    throw new TooManyRequestsException("Rate limit exceeded");
  } else {
    throw new InternalServerErrorException("Integration service unavailable");
  }
}
```

### **2. Cache y Performance**

```typescript
// ✅ Bueno: Cache inteligente
@Injectable()
export class ElevenLabsService {
  private voicesCache = new Map();
  private cacheExpiry = 3600000; // 1 hora

  async getVoices(): Promise<Voice[]> {
    const cacheKey = "voices";
    const cached = this.voicesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const voices = await this.fetchVoicesFromAPI();
    this.voicesCache.set(cacheKey, {
      data: voices,
      timestamp: Date.now(),
    });

    return voices;
  }
}
```

### **3. Seguridad**

```typescript
// ✅ Bueno: Validación de webhooks
@Post('/webhooks/:service')
async handleWebhook(
  @Param('service') service: string,
  @Body() payload: any,
  @Headers() headers: any
) {
  const signature = headers['x-webhook-signature'];
  const secret = await this.getWebhookSecret(service);

  if (!this.verifyWebhookSignature(payload, signature, secret)) {
    this.logger.warn('Invalid webhook signature', { service });
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // Procesar webhook
  await this.processWebhook(service, payload);
}
```

### **4. Monitoreo**

```typescript
// ✅ Bueno: Métricas de integración
@Injectable()
export class IntegrationMetricsService {
  async recordIntegrationCall(
    service: string,
    success: boolean,
    duration: number,
  ) {
    await this.metricsService.increment(`integration.${service}.calls.total`);

    if (success) {
      await this.metricsService.increment(
        `integration.${service}.calls.success`,
      );
    } else {
      await this.metricsService.increment(
        `integration.${service}.calls.failed`,
      );
    }

    await this.metricsService.histogram(
      `integration.${service}.duration`,
      duration,
    );
  }
}
```

---

## 📞 **SOPORTE**

### **Recursos Adicionales**

- [API Documentation](./API_DOCUMENTATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Security Guide](./SECURITY_GUIDE.md)

### **Comunidad**

- **Discord:** [Servidor de Desarrolladores](https://discord.gg/prixagent)
- **GitHub:** [Issues](https://github.com/prixagent/issues)
- **Email:** integrations@prixagent.com

### **Documentación de APIs Externas**

- [ElevenLabs API](https://docs.elevenlabs.io/)
- [GoHighLevel API](https://highlevel.stoplight.io/)
- [Twilio API](https://www.twilio.com/docs)
- [PayPal API](https://developer.paypal.com/docs/api/)
- [Cal.com API](https://cal.com/docs/api-reference)
- [N8N API](https://docs.n8n.io/api/)

---

**Última actualización:** 10 de Enero, 2025  
**Versión:** v1.0.0  
**Mantenido por:** Equipo de Desarrollo PrixAgent
