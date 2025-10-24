# API Endpoints - Dashboard de Administración

## Base URL

```
https://admin-api.yourapp.com/api/v1/admin
```

## Autenticación

Todos los endpoints requieren autenticación JWT de administrador en el header:

```
Authorization: Bearer <admin_jwt_token>
```

## Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer <admin_jwt_token>
```

---

## 1. Autenticación de Administradores

### POST /admin/auth/login

Iniciar sesión como administrador

```json
{
  "email": "admin@yourapp.com",
  "password": "password123",
  "twoFactorCode": "123456"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "email": "admin@yourapp.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "permissions": [
      {
        "resource": "accounts",
        "actions": ["read", "write", "delete"]
      }
    ],
    "twoFactorEnabled": true
  }
}
```

### POST /admin/auth/refresh

Renovar token de administrador

```json
{
  "refresh_token": "refresh_token_here"
}
```

### POST /admin/auth/logout

Cerrar sesión de administrador

### POST /admin/auth/verify-2fa

Verificar código 2FA

```json
{
  "adminId": "uuid",
  "code": "123456"
}
```

---

## 2. Gestión de Modelos LLM

### GET /admin/llm/models

Obtener todos los modelos LLM configurados
**Response:**

```json
{
  "data": [
    {
      "id": "gpt-5",
      "name": "GPT-5",
      "provider": "openai",
      "maxTokens": 200000,
      "costPerToken": 0.00005,
      "isActive": true,
      "isAvailable": true,
      "description": "Modelo más avanzado de OpenAI",
      "features": ["reasoning", "multimodal", "long_context"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "gemini-2.5-pro",
      "name": "Gemini 2.5 Pro",
      "provider": "gemini",
      "maxTokens": 1000000,
      "costPerToken": 0.00002,
      "isActive": true,
      "isAvailable": true,
      "description": "Modelo más avanzado de Google",
      "features": ["thinking", "multimodal", "long_context"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /admin/llm/models

Agregar nuevo modelo LLM

```json
{
  "id": "gpt-6",
  "name": "GPT-6",
  "provider": "openai",
  "maxTokens": 500000,
  "costPerToken": 0.00008,
  "description": "Próximo modelo de OpenAI",
  "features": ["advanced_reasoning", "multimodal", "ultra_long_context"],
  "isActive": false,
  "isAvailable": false
}
```

### PUT /admin/llm/models/:id

Actualizar modelo LLM

```json
{
  "name": "GPT-5 Updated",
  "costPerToken": 0.00006,
  "isActive": true,
  "description": "Modelo actualizado con nuevas características"
}
```

### DELETE /admin/llm/models/:id

Eliminar modelo LLM

### POST /admin/llm/models/:id/toggle

Activar/desactivar modelo

```json
{
  "isActive": true
}
```

### GET /admin/llm/models/:id/usage

Obtener estadísticas de uso del modelo
**Response:**

```json
{
  "modelId": "gpt-5",
  "totalRequests": 15000,
  "totalTokens": 2500000,
  "totalCost": 125.0,
  "averageResponseTime": 850,
  "successRate": 99.2,
  "usageByAccount": [
    {
      "accountId": "uuid",
      "accountName": "Empresa A",
      "requests": 5000,
      "tokens": 800000,
      "cost": 40.0
    }
  ],
  "dailyUsage": [
    {
      "date": "2024-01-01",
      "requests": 500,
      "tokens": 80000,
      "cost": 4.0
    }
  ]
}
```

---

## 3. Gestión de Accounts

### GET /admin/accounts

Obtener lista de todos los accounts
**Query Parameters:**

- `page`: número de página (default: 1)
- `limit`: elementos por página (default: 10)
- `search`: búsqueda por nombre o email
- `status`: filtrar por estado (active, suspended, cancelled)
- `plan`: filtrar por plan (basic, pro, enterprise)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Empresa ABC",
      "slug": "empresa-abc",
      "email": "contacto@empresaabc.com",
      "phone": "+1234567890",
      "timezone": "America/Mexico_City",
      "status": "active",
      "subscriptionPlan": "pro",
      "billingEmail": "billing@empresaabc.com",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "stats": {
        "totalUsers": 5,
        "totalAgents": 12,
        "totalCalls": 1500,
        "totalMinutes": 2500,
        "monthlySpend": 150.0
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

### GET /admin/accounts/:id

Obtener detalles de un account específico
**Response:**

```json
{
  "id": "uuid",
  "name": "Empresa ABC",
  "slug": "empresa-abc",
  "email": "contacto@empresaabc.com",
  "phone": "+1234567890",
  "timezone": "America/Mexico_City",
  "status": "active",
  "subscriptionPlan": "pro",
  "billingEmail": "billing@empresaabc.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "users": [
    {
      "id": "uuid",
      "email": "user@empresaabc.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "admin",
      "status": "active",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ],
  "agents": [
    {
      "id": "uuid",
      "name": "Agente Ventas",
      "type": "outbound",
      "status": "active",
      "totalCalls": 500,
      "successRate": 85.5
    }
  ],
  "billing": {
    "currentPlan": "pro",
    "monthlyCost": 79.0,
    "usage": {
      "minutes": 2500,
      "calls": 1500,
      "overage": 0.0
    },
    "nextBillingDate": "2024-02-01T00:00:00Z"
  }
}
```

### POST /admin/accounts

Crear nuevo account

```json
{
  "name": "Nueva Empresa",
  "email": "contacto@nuevaempresa.com",
  "phone": "+1234567890",
  "timezone": "America/Mexico_City",
  "subscriptionPlan": "basic",
  "billingEmail": "billing@nuevaempresa.com"
}
```

### PUT /admin/accounts/:id

Actualizar account

```json
{
  "name": "Empresa Actualizada",
  "subscriptionPlan": "enterprise",
  "status": "active"
}
```

### DELETE /admin/accounts/:id

Eliminar account

### POST /admin/accounts/:id/suspend

Suspender account

```json
{
  "reason": "Payment overdue",
  "suspensionType": "temporary"
}
```

### POST /admin/accounts/:id/activate

Activar account

### GET /admin/accounts/:id/usage

Obtener estadísticas de uso del account
**Response:**

```json
{
  "accountId": "uuid",
  "period": "2024-01",
  "usage": {
    "totalCalls": 1500,
    "totalMinutes": 2500,
    "totalAgents": 12,
    "totalUsers": 5
  },
  "costs": {
    "basePlan": 79.0,
    "overage": 25.0,
    "total": 104.0
  },
  "dailyBreakdown": [
    {
      "date": "2024-01-01",
      "calls": 50,
      "minutes": 85,
      "cost": 4.25
    }
  ]
}
```

---

## 4. Gestión de Usuarios

### GET /admin/users

Obtener lista de todos los usuarios
**Query Parameters:**

- `page`, `limit`, `search`
- `role`: filtrar por rol
- `status`: filtrar por estado
- `accountId`: filtrar por account

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@empresa.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "admin",
      "status": "active",
      "accountId": "uuid",
      "accountName": "Empresa ABC",
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 10
  }
}
```

### GET /admin/users/:id

Obtener usuario específico

### POST /admin/users

Crear nuevo usuario

```json
{
  "email": "nuevo@empresa.com",
  "firstName": "María",
  "lastName": "García",
  "role": "user",
  "accountId": "uuid",
  "sendInvitation": true
}
```

### PUT /admin/users/:id

Actualizar usuario

### DELETE /admin/users/:id

Eliminar usuario

### POST /admin/users/:id/reset-password

Resetear contraseña de usuario

---

## 5. Analytics y Métricas

### GET /admin/analytics/overview

Obtener métricas generales del sistema
**Response:**

```json
{
  "period": "2024-01",
  "metrics": {
    "totalAccounts": 150,
    "activeAccounts": 145,
    "totalUsers": 750,
    "totalAgents": 300,
    "totalCalls": 50000,
    "totalMinutes": 85000,
    "totalRevenue": 15000.0,
    "averageRevenuePerAccount": 100.0
  },
  "growth": {
    "accounts": 15.5,
    "users": 25.3,
    "calls": 45.2,
    "revenue": 30.8
  },
  "topAccounts": [
    {
      "accountId": "uuid",
      "accountName": "Empresa A",
      "revenue": 500.0,
      "calls": 2000,
      "minutes": 3500
    }
  ]
}
```

### GET /admin/analytics/revenue

Obtener métricas de ingresos
**Query Parameters:**

- `startDate`: fecha de inicio
- `endDate`: fecha de fin
- `groupBy`: agrupar por (day, week, month)

**Response:**

```json
{
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "totalRevenue": 15000.0,
  "revenueByPlan": [
    {
      "plan": "basic",
      "revenue": 5000.0,
      "accounts": 50
    },
    {
      "plan": "pro",
      "revenue": 8000.0,
      "accounts": 80
    },
    {
      "plan": "enterprise",
      "revenue": 2000.0,
      "accounts": 10
    }
  ],
  "dailyRevenue": [
    {
      "date": "2024-01-01",
      "revenue": 500.0,
      "newAccounts": 2,
      "churn": 0
    }
  ],
  "churnRate": 2.5,
  "mrr": 15000.0,
  "arr": 180000.0
}
```

### GET /admin/analytics/usage

Obtener métricas de uso
**Response:**

```json
{
  "period": "2024-01",
  "usage": {
    "totalCalls": 50000,
    "totalMinutes": 85000,
    "averageCallDuration": 102,
    "peakUsageHour": 14,
    "usageByDay": [
      {
        "day": "Monday",
        "calls": 8000,
        "minutes": 13600
      }
    ]
  },
  "performance": {
    "averageResponseTime": 850,
    "successRate": 98.5,
    "errorRate": 1.5
  },
  "topAgents": [
    {
      "agentId": "uuid",
      "agentName": "Agente Ventas",
      "calls": 5000,
      "successRate": 95.2
    }
  ]
}
```

### GET /admin/analytics/performance

Obtener métricas de rendimiento
**Response:**

```json
{
  "system": {
    "uptime": 99.9,
    "averageResponseTime": 200,
    "errorRate": 0.1,
    "throughput": 1000
  },
  "llm": {
    "averageResponseTime": 850,
    "successRate": 98.5,
    "costPerRequest": 0.05,
    "usageByModel": [
      {
        "model": "gpt-5",
        "requests": 25000,
        "averageResponseTime": 900,
        "successRate": 99.0
      }
    ]
  },
  "infrastructure": {
    "cpu": 45.2,
    "memory": 67.8,
    "disk": 23.1,
    "network": 12.5
  }
}
```

---

## 6. Monitoreo del Sistema

### GET /admin/monitoring/health

Obtener salud del sistema
**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": [
    {
      "name": "API",
      "status": "healthy",
      "responseTime": 150,
      "uptime": 99.9
    },
    {
      "name": "Database",
      "status": "healthy",
      "responseTime": 25,
      "connections": 45
    },
    {
      "name": "Redis",
      "status": "healthy",
      "responseTime": 5,
      "memory": 256
    }
  ],
  "infrastructure": {
    "cpu": 45.2,
    "memory": 67.8,
    "disk": 23.1,
    "network": 12.5
  },
  "alerts": [
    {
      "id": "uuid",
      "type": "warning",
      "message": "High CPU usage detected",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ]
}
```

### GET /admin/monitoring/logs

Obtener logs del sistema
**Query Parameters:**

- `level`: filtrar por nivel (info, warning, error, critical)
- `service`: filtrar por servicio
- `startDate`: fecha de inicio
- `endDate`: fecha de fin
- `limit`: número de logs (default: 100)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "level": "error",
      "service": "API",
      "message": "Database connection failed",
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "userId": "uuid",
        "accountId": "uuid",
        "requestId": "uuid"
      }
    }
  ],
  "meta": {
    "total": 1000,
    "page": 1,
    "limit": 100
  }
}
```

### GET /admin/monitoring/alerts

Obtener alertas del sistema
**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "warning",
      "severity": "medium",
      "title": "High CPU Usage",
      "message": "CPU usage is above 80%",
      "status": "active",
      "createdAt": "2024-01-15T10:25:00Z",
      "resolvedAt": null
    }
  ]
}
```

### POST /admin/monitoring/alerts/:id/resolve

Resolver alerta

```json
{
  "resolution": "Restarted service",
  "notes": "Service restarted successfully"
}
```

---

## 7. Gestión de Facturación

### GET /admin/billing/overview

Obtener resumen de facturación
**Response:**

```json
{
  "period": "2024-01",
  "metrics": {
    "totalRevenue": 15000.0,
    "totalInvoices": 150,
    "paidInvoices": 145,
    "pendingInvoices": 5,
    "overdueInvoices": 2,
    "averageInvoiceAmount": 100.0
  },
  "revenueByPlan": [
    {
      "plan": "basic",
      "revenue": 5000.0,
      "accounts": 50
    }
  ],
  "paymentMethods": [
    {
      "method": "credit_card",
      "percentage": 85.5,
      "amount": 12825.0
    }
  ]
}
```

### GET /admin/billing/invoices

Obtener lista de facturas
**Query Parameters:**

- `status`: filtrar por estado (paid, pending, overdue)
- `startDate`: fecha de inicio
- `endDate`: fecha de fin

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2024-001",
      "accountId": "uuid",
      "accountName": "Empresa ABC",
      "amount": 79.0,
      "status": "paid",
      "dueDate": "2024-02-01",
      "paidDate": "2024-01-25",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10
  }
}
```

### GET /admin/billing/invoices/:id

Obtener factura específica

### POST /admin/billing/invoices/:id/refund

Procesar reembolso

```json
{
  "amount": 79.0,
  "reason": "Customer requested refund",
  "notes": "Full refund processed"
}
```

---

## 8. Gestión de Seguridad

### GET /admin/security/audit-logs

Obtener logs de auditoría
**Query Parameters:**

- `userId`: filtrar por usuario
- `action`: filtrar por acción
- `startDate`: fecha de inicio
- `endDate`: fecha de fin

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userEmail": "admin@yourapp.com",
      "action": "account.created",
      "resource": "account",
      "resourceId": "uuid",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "accountName": "Nueva Empresa"
      }
    }
  ],
  "meta": {
    "total": 1000,
    "page": 1,
    "limit": 10
  }
}
```

### GET /admin/security/api-keys

Obtener lista de API keys
**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Production API Key",
      "key": "ak_***",
      "permissions": ["read", "write"],
      "isActive": true,
      "lastUsed": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /admin/security/api-keys

Crear nueva API key

```json
{
  "name": "New API Key",
  "permissions": ["read", "write"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### DELETE /admin/security/api-keys/:id

Eliminar API key

---

## 9. Gestión de Soporte

### GET /admin/support/tickets

Obtener tickets de soporte
**Query Parameters:**

- `status`: filtrar por estado (open, in_progress, resolved, closed)
- `priority`: filtrar por prioridad (low, medium, high, urgent)
- `assignee`: filtrar por asignado

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Problema con agente de IA",
      "description": "El agente no responde correctamente",
      "status": "open",
      "priority": "high",
      "accountId": "uuid",
      "accountName": "Empresa ABC",
      "userId": "uuid",
      "userEmail": "user@empresa.com",
      "assigneeId": "uuid",
      "assigneeName": "Admin User",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### GET /admin/support/tickets/:id

Obtener ticket específico

### PUT /admin/support/tickets/:id

Actualizar ticket

```json
{
  "status": "in_progress",
  "assigneeId": "uuid",
  "priority": "high"
}
```

### POST /admin/support/tickets/:id/comments

Agregar comentario al ticket

```json
{
  "content": "Investigando el problema",
  "isInternal": true
}
```

---

## 10. Configuración del Sistema

### GET /admin/system/config

Obtener configuración del sistema
**Response:**

```json
{
  "general": {
    "appName": "AI Agent SaaS",
    "appVersion": "1.0.0",
    "maintenanceMode": false,
    "registrationEnabled": true
  },
  "llm": {
    "defaultProvider": "openai",
    "defaultModel": "gpt-5",
    "maxTokens": 500,
    "rateLimit": 1000
  },
  "billing": {
    "currency": "USD",
    "taxRate": 0.16,
    "gracePeriod": 7
  },
  "security": {
    "passwordMinLength": 8,
    "sessionTimeout": 24,
    "twoFactorRequired": false
  }
}
```

### PUT /admin/system/config

Actualizar configuración del sistema

```json
{
  "general": {
    "maintenanceMode": true,
    "registrationEnabled": false
  },
  "llm": {
    "defaultModel": "gemini-2.5-pro",
    "rateLimit": 2000
  }
}
```

### POST /admin/system/maintenance

Activar modo mantenimiento

```json
{
  "enabled": true,
  "message": "Sistema en mantenimiento programado",
  "estimatedDuration": "2 hours"
}
```

---

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Formato de Errores

```json
{
  "error": {
    "code": "ADMIN_ACCESS_DENIED",
    "message": "Insufficient permissions",
    "details": [
      {
        "field": "permissions",
        "message": "Admin role required"
      }
    ]
  }
}
```

## Rate Limiting

- Límite: 5000 requests por hora por administrador
- Headers de respuesta:
  - `X-RateLimit-Limit`: límite total
  - `X-RateLimit-Remaining`: requests restantes
  - `X-RateLimit-Reset`: timestamp de reset

## Permisos Requeridos

Cada endpoint requiere permisos específicos:

- `accounts.read` - Leer accounts
- `accounts.write` - Crear/editar accounts
- `accounts.delete` - Eliminar accounts
- `users.read` - Leer usuarios
- `users.write` - Crear/editar usuarios
- `system.read` - Leer configuración del sistema
- `system.write` - Modificar configuración del sistema
- `analytics.read` - Leer analytics
- `billing.read` - Leer facturación
- `billing.write` - Modificar facturación
- `security.read` - Leer logs de seguridad
- `support.read` - Leer tickets de soporte
- `support.write` - Gestionar tickets de soporte
