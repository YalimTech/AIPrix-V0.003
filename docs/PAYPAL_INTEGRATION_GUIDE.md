# 💳 Guía de Integración PayPal - Sistema de Membresías

## 🎯 Propósito

PayPal se encarga del **cobro de membresías** para el acceso a la plataforma PrixAgent SaaS, mientras que ElevenLabs maneja el cobro por uso (minutos/tokens).

## 🏗️ Arquitectura de Pagos

### **Modelo de Negocio:**
```
┌─────────────────┐    ┌─────────────────┐
│   MEMBRESÍAS    │    │   USO/TOKENS    │
│                 │    │                 │
│     PayPal      │    │   ElevenLabs    │
│                 │    │                 │
│ • Suscripciones │    │ • Minutos       │
│ • Planes        │    │ • Tokens        │
│ • Facturación   │    │ • TTS/STT       │
└─────────────────┘    └─────────────────┘
```

## 🔧 Configuración PayPal

### **Variables de Entorno:**
```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # o 'live' para producción
PAYPAL_WEBHOOK_ID=your-webhook-id
```

### **Planes de Membresía:**
```typescript
export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxAgents: number;
    maxCallsPerMonth: number;
    maxMinutesPerMonth: number;
  };
}
```

## 🚀 Implementación

### **1. Servicio PayPal:**
```typescript
// src/integrations/paypal/paypal.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayPalApi } from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalService {
  private paypalClient: PayPalApi;

  constructor(private configService: ConfigService) {
    this.paypalClient = new PayPalApi({
      clientId: this.configService.get('PAYPAL_CLIENT_ID'),
      clientSecret: this.configService.get('PAYPAL_CLIENT_SECRET'),
      mode: this.configService.get('PAYPAL_MODE'),
    });
  }

  async createSubscription(planId: string, userId: string) {
    // Crear suscripción PayPal
  }

  async cancelSubscription(subscriptionId: string) {
    // Cancelar suscripción
  }

  async getSubscriptionDetails(subscriptionId: string) {
    // Obtener detalles de suscripción
  }
}
```

### **2. Webhooks PayPal:**
```typescript
// src/webhooks/paypal.webhook.ts
@Controller('webhooks/paypal')
export class PayPalWebhookController {
  @Post()
  async handleWebhook(@Body() payload: any) {
    // Procesar eventos de PayPal
    switch (payload.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await this.activateSubscription(payload);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await this.cancelSubscription(payload);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        await this.processPayment(payload);
        break;
    }
  }
}
```

## 📊 Modelos de Base de Datos

### **Tabla de Membresías:**
```sql
-- En schema.prisma
model Membership {
  id              String   @id @default(cuid())
  userId          String
  planId          String
  paypalSubId     String   @unique
  status          String   // active, cancelled, expired
  startDate       DateTime
  endDate         DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  plan            Plan     @relation(fields: [planId], references: [id])
  payments        Payment[]
}

model Plan {
  id              String   @id @default(cuid())
  name            String
  price           Decimal
  currency        String   @default("USD")
  interval        String   // monthly, yearly
  features        Json
  limits          Json
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  
  memberships     Membership[]
}

model Payment {
  id              String   @id @default(cuid())
  membershipId    String
  paypalPaymentId String   @unique
  amount          Decimal
  currency        String
  status          String   // completed, pending, failed
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  
  membership      Membership @relation(fields: [membershipId], references: [id])
}
```

## 🔄 Flujo de Suscripción

### **1. Usuario Selecciona Plan:**
```typescript
async selectPlan(userId: string, planId: string) {
  const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
  const subscription = await this.paypalService.createSubscription(planId, userId);
  
  return {
    approvalUrl: subscription.links.find(link => link.rel === 'approve').href
  };
}
```

### **2. Usuario Aprueba en PayPal:**
```typescript
async approveSubscription(subscriptionId: string) {
  const subscription = await this.paypalService.getSubscriptionDetails(subscriptionId);
  
  if (subscription.status === 'ACTIVE') {
    await this.prisma.membership.create({
      data: {
        userId: subscription.custom_id,
        planId: subscription.plan_id,
        paypalSubId: subscriptionId,
        status: 'active',
        startDate: new Date(),
      }
    });
  }
}
```

### **3. Webhook Confirma Pago:**
```typescript
async processPayment(payload: any) {
  const membership = await this.prisma.membership.findFirst({
    where: { paypalSubId: payload.resource.billing_agreement_id }
  });
  
  if (membership) {
    await this.prisma.payment.create({
      data: {
        membershipId: membership.id,
        paypalPaymentId: payload.resource.id,
        amount: payload.resource.amount.total,
        currency: payload.resource.amount.currency,
        status: 'completed',
        paidAt: new Date(),
      }
    });
  }
}
```

## 🛡️ Seguridad

### **Validación de Webhooks:**
```typescript
async validateWebhook(headers: any, body: string) {
  const signature = headers['paypal-transmission-sig'];
  const certId = headers['paypal-cert-id'];
  const transmissionId = headers['paypal-transmission-id'];
  const timestamp = headers['paypal-transmission-time'];
  
  // Validar firma PayPal
  return this.paypalService.validateWebhook({
    signature,
    certId,
    transmissionId,
    timestamp,
    body
  });
}
```

## 📈 Monitoreo y Analytics

### **Métricas Importantes:**
- Tasa de conversión de planes
- Churn rate (cancelaciones)
- Revenue por plan
- Tiempo promedio de activación

### **Dashboard de Membresías:**
```typescript
async getMembershipStats() {
  return {
    totalActive: await this.prisma.membership.count({ where: { status: 'active' } }),
    monthlyRevenue: await this.getMonthlyRevenue(),
    churnRate: await this.getChurnRate(),
    popularPlans: await this.getPopularPlans(),
  };
}
```

## 🔗 Integración con GoHighLevel

### **Sincronización de Clientes:**
```typescript
async syncWithGHL(membership: Membership) {
  const user = await this.prisma.user.findUnique({
    where: { id: membership.userId }
  });
  
  // Crear/actualizar contacto en GHL
  await this.ghlService.createOrUpdateContact({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    tags: [`plan-${membership.plan.name}`, 'paying-customer'],
    customFields: {
      membership_status: membership.status,
      plan_name: membership.plan.name,
      subscription_id: membership.paypalSubId,
    }
  });
}
```

---

## 📚 Recursos Adicionales

- [PayPal Developer Documentation](https://developer.paypal.com/)
- [PayPal Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
- [PayPal Webhooks](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [PayPal SDK for Node.js](https://github.com/paypal/PayPal-node-SDK)
