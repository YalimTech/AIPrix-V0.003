# Arquitectura Twilio para SaaS Multi-tenant

## 🎯 Recomendación para PrixAgent

### **Opción Recomendada: Subaccounts + API Keys**

Para un SaaS multi-tenant como PrixAgent, la mejor práctica es:

1. **Subcuenta por cliente** - Aislamiento total
2. **API Keys específicas** - Seguridad mejorada
3. **Credenciales encriptadas** - Protección de datos

## 🏗️ Arquitectura Propuesta

### **1. Estructura de Base de Datos**

```sql
-- Configuración de Twilio por cliente
CREATE TABLE "account_twilio_config" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,

    -- Subcuenta de Twilio
    "subaccount_sid" VARCHAR(255) NOT NULL,
    "subaccount_auth_token" TEXT NOT NULL, -- Encriptado

    -- API Keys específicas
    "api_key_sid" VARCHAR(255) NOT NULL,
    "api_key_secret" TEXT NOT NULL, -- Encriptado

    -- Estado de la cuenta
    "status" VARCHAR(20) DEFAULT 'active', -- active, trial, suspended
    "webhook_url" VARCHAR(500),

    -- Metadatos
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE("account_id")
);
```

### **2. Flujo de Configuración**

```typescript
// 1. Cliente se registra
const newAccount = await createAccount(accountData);

// 2. Crear subcuenta en Twilio
const subaccount = await twilioClient.api.accounts.create({
  friendlyName: `${accountData.name} - Subaccount`,
  status: "active",
});

// 3. Crear API Key para la subcuenta
const apiKey = await twilioClient.newKeys.create({
  friendlyName: `${accountData.name} - API Key`,
});

// 4. Guardar credenciales encriptadas
await prisma.accountTwilioConfig.create({
  data: {
    accountId: newAccount.id,
    subaccountSid: subaccount.sid,
    subaccountAuthToken: encrypt(subaccount.authToken),
    apiKeySid: apiKey.sid,
    apiKeySecret: encrypt(apiKey.secret),
    status: "active",
  },
});
```

### **3. Cliente Twilio por Account**

```typescript
// Servicio para crear cliente específico por account
async createTwilioClientForAccount(accountId: string): Promise<twilio.Twilio> {
    const config = await this.getTwilioConfig(accountId);

    // Usar API Key en lugar de Auth Token
    return twilio(
        config.subaccountSid,
        config.apiKeySid,
        config.apiKeySecret
    );
}
```

## 🔒 Beneficios de Seguridad

### **1. Aislamiento Total**

- Cada cliente tiene su propia subcuenta
- Datos completamente separados
- Facturación independiente

### **2. Seguridad Mejorada**

- API Keys específicas por cliente
- Credenciales encriptadas en BD
- Rotación fácil de credenciales

### **3. Compliance**

- Separación de datos por cliente
- Auditoría por subcuenta
- Cumplimiento de regulaciones

## 📊 Gestión de Costos

### **1. Facturación por Cliente**

```typescript
// Obtener uso por subcuenta
const usage = await twilioClient.usage.records.list({
  accountSid: subaccountSid,
  category: "calls",
});
```

### **2. Límites por Cliente**

```typescript
// Configurar límites en subcuenta
await twilioClient.api.accounts(subaccountSid).update({
  status: "active",
  // Límites automáticos por plan
});
```

## 🚀 Implementación Gradual

### **Fase 1: Migración a API Keys**

1. Mantener estructura actual
2. Agregar soporte para API Keys
3. Migrar clientes existentes

### **Fase 2: Implementar Subaccounts**

1. Crear subcuentas para nuevos clientes
2. Migrar clientes existentes gradualmente
3. Implementar gestión de subcuentas

### **Fase 3: Optimización**

1. Implementar límites automáticos
2. Facturación por subcuenta
3. Monitoreo avanzado

## 🎯 Conclusión

Para PrixAgent, la arquitectura recomendada es:

1. **Subcuenta por cliente** - Aislamiento total
2. **API Keys específicas** - Seguridad mejorada
3. **Credenciales encriptadas** - Protección de datos
4. **Migración gradual** - Sin interrupciones

Esta arquitectura proporciona:

- ✅ **Seguridad empresarial**
- ✅ **Escalabilidad ilimitada**
- ✅ **Compliance total**
- ✅ **Gestión de costos precisa**
