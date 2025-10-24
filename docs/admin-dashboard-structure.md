# Dashboard de Administración - Estructura Completa

## 🎯 Concepto del Dashboard de Administración

El dashboard de administración es una aplicación web **completamente separada** del dashboard de clientes, accesible desde un dominio/subdominio diferente, con funcionalidades exclusivas para desarrolladores y administradores del SaaS.

## 🏗️ Arquitectura del Sistema Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA COMPLETO                            │
├─────────────────────────────────────────────────────────────────┤
│  • Backend API (NestJS) - Compartido                          │
│  • Base de Datos (PostgreSQL) - Compartida                    │
│  • Redis Cache - Compartido                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD DE CLIENTES                       │
├─────────────────────────────────────────────────────────────────┤
│  • URL: app.yourapp.com                                       │
│  • Frontend: React + TypeScript                               │
│  • Acceso: Solo clientes (accounts)                            │
│  • Funcionalidades: Gestión de agentes, campañas, etc.        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD DE ADMINISTRACIÓN                 │
├─────────────────────────────────────────────────────────────────┤
│  • URL: admin.yourapp.com                                     │
│  • Frontend: React + TypeScript (Separado)                    │
│  • Acceso: Solo administradores/desarrolladores               │
│  • Funcionalidades: Gestión del SaaS, métricas, etc.          │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Dashboard de Administración

```
admin-dashboard/
├── src/
│   ├── App.tsx                     # Componente principal
│   ├── index.tsx                   # Punto de entrada
│   ├── main.tsx                    # Configuración de Vite
│   ├── vite.config.ts              # Configuración de Vite
│   ├── tailwind.config.js          # Configuración de Tailwind CSS
│   ├── components/                 # Componentes reutilizables
│   │   ├── ui/                     # Componentes de UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Chart.tsx
│   │   │   └── index.ts
│   │   ├── layout/                 # Componentes de layout
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── index.ts
│   │   ├── forms/                  # Componentes de formularios
│   │   │   ├── AccountForm.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── SystemConfigForm.tsx
│   │   │   ├── LLMModelForm.tsx
│   │   │   └── index.ts
│   │   ├── charts/                 # Componentes de gráficos
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── UsageChart.tsx
│   │   │   └── index.ts
│   │   └── common/                 # Componentes comunes
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── Toast.tsx
│   │       ├── DataTable.tsx
│   │       ├── SearchBar.tsx
│   │       ├── FilterBar.tsx
│   │       └── index.ts
│   ├── pages/                      # Páginas principales
│   │   ├── Dashboard/              # Dashboard principal
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Overview.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   ├── RevenueMetrics.tsx
│   │   │   ├── UsageMetrics.tsx
│   │   │   └── index.ts
│   │   ├── Accounts/                # Gestión de accounts
│   │   │   ├── AccountsList.tsx
│   │   │   ├── AccountDetail.tsx
│   │   │   ├── CreateAccount.tsx
│   │   │   ├── EditAccount.tsx
│   │   │   ├── AccountBilling.tsx
│   │   │   ├── AccountUsage.tsx
│   │   │   └── index.ts
│   │   ├── Users/                  # Gestión de usuarios
│   │   │   ├── UsersList.tsx
│   │   │   ├── UserDetail.tsx
│   │   │   ├── CreateUser.tsx
│   │   │   ├── EditUser.tsx
│   │   │   ├── UserRoles.tsx
│   │   │   └── index.ts
│   │   ├── System/                 # Configuración del sistema
│   │   │   ├── SystemConfig.tsx
│   │   │   ├── LLMModels.tsx
│   │   │   ├── APIConfig.tsx
│   │   │   ├── Integrations.tsx
│   │   │   ├── Webhooks.tsx
│   │   │   └── index.ts
│   │   ├── Analytics/              # Analytics avanzados
│   │   │   ├── Analytics.tsx
│   │   │   ├── RevenueAnalytics.tsx
│   │   │   ├── UsageAnalytics.tsx
│   │   │   ├── PerformanceAnalytics.tsx
│   │   │   ├── UserAnalytics.tsx
│   │   │   └── index.ts
│   │   ├── Billing/                # Gestión de facturación
│   │   │   ├── BillingOverview.tsx
│   │   │   ├── Invoices.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Subscriptions.tsx
│   │   │   ├── Plans.tsx
│   │   │   └── index.ts
│   │   ├── Monitoring/             # Monitoreo del sistema
│   │   │   ├── SystemHealth.tsx
│   │   │   ├── Performance.tsx
│   │   │   ├── Logs.tsx
│   │   │   ├── Alerts.tsx
│   │   │   ├── Metrics.tsx
│   │   │   └── index.ts
│   │   ├── Security/               # Seguridad
│   │   │   ├── SecurityOverview.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   ├── AccessControl.tsx
│   │   │   ├── APIKeys.tsx
│   │   │   └── index.ts
│   │   ├── Support/                # Soporte
│   │   │   ├── SupportTickets.tsx
│   │   │   ├── TicketDetail.tsx
│   │   │   ├── KnowledgeBase.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── index.ts
│   │   ├── Auth/                   # Autenticación
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── TwoFactor.tsx
│   │   │   ├── PasswordReset.tsx
│   │   │   └── index.ts
│   │   └── Error/                  # Páginas de error
│   │       ├── NotFound.tsx
│   │       ├── Unauthorized.tsx
│   │       ├── Forbidden.tsx
│   │       └── index.ts
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useAdmin.ts
│   │   ├── useWebSocket.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePermissions.ts
│   │   └── index.ts
│   ├── services/                   # Servicios de API
│   │   ├── api.ts                  # Cliente base de API
│   │   ├── auth.service.ts
│   │   ├── accounts.service.ts
│   │   ├── users.service.ts
│   │   ├── system.service.ts
│   │   ├── analytics.service.ts
│   │   ├── billing.service.ts
│   │   ├── monitoring.service.ts
│   │   ├── security.service.ts
│   │   ├── support.service.ts
│   │   └── index.ts
│   ├── store/                      # Estado global (Zustand)
│   │   ├── auth.store.ts
│   │   ├── admin.store.ts
│   │   ├── accounts.store.ts
│   │   ├── users.store.ts
│   │   ├── system.store.ts
│   │   ├── analytics.store.ts
│   │   └── index.ts
│   ├── types/                      # Tipos TypeScript
│   │   ├── auth.types.ts
│   │   ├── account.types.ts
│   │   ├── user.types.ts
│   │   ├── system.types.ts
│   ├── analytics.types.ts
│   ├── billing.types.ts
│   ├── monitoring.types.ts
│   ├── security.types.ts
│   ├── support.types.ts
│   ├── api.types.ts
│   └── index.ts
│   ├── utils/                      # Utilidades
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── permissions.ts
│   │   └── index.ts
│   ├── styles/                     # Estilos
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   └── assets/                     # Recursos estáticos
│       ├── images/
│       ├── icons/
│       └── fonts/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🔐 Sistema de Autenticación y Autorización

### Roles de Administración

```typescript
// types/auth.types.ts
export enum AdminRole {
  SUPER_ADMIN = "super_admin", // Acceso total al sistema
  ADMIN = "admin", // Gestión de accounts y usuarios
  DEVELOPER = "developer", // Configuración técnica
  SUPPORT = "support", // Soporte a clientes
  BILLING = "billing", // Gestión de facturación
  ANALYST = "analyst", // Solo lectura de analytics
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin: Date;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  actions: string[];
}
```

### Middleware de Autorización

```typescript
// hooks/usePermissions.ts
import { useAuth } from "./useAuth";
import { AdminRole, Permission } from "../types/auth.types";

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Super admin tiene acceso a todo
    if (user.role === AdminRole.SUPER_ADMIN) return true;

    // Verificar permisos específicos
    const permission = user.permissions.find((p) => p.resource === resource);
    return permission?.actions.includes(action) || false;
  };

  const hasRole = (role: AdminRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: AdminRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    user,
  };
};
```

## 📊 Funcionalidades del Dashboard de Administración

### 1. Dashboard Principal

```typescript
// pages/Dashboard/AdminDashboard.tsx
import React from 'react';
import { StatsCards } from './StatsCards';
import { RevenueMetrics } from './RevenueMetrics';
import { UsageMetrics } from './UsageMetrics';
import { SystemHealth } from '../Monitoring/SystemHealth';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visión general del sistema y métricas clave
        </p>
      </div>

      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueMetrics />
        <UsageMetrics />
      </div>
      <SystemHealth />
    </div>
  );
};
```

### 2. Gestión de Accounts

```typescript
// pages/Accounts/AccountsList.tsx
import React, { useState } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AccountsList: React.FC = () => {
  const { accounts, loading, deleteAccount, suspendAccount } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      key: 'name',
      title: 'Nombre',
      render: (account: any) => account.name,
    },
    {
      key: 'email',
      title: 'Email',
      render: (account: any) => account.email,
    },
    {
      key: 'plan',
      title: 'Plan',
      render: (account: any) => (
        <Badge variant={account.subscriptionPlan === 'enterprise' ? 'green' : 'blue'}>
          {account.subscriptionPlan}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Estado',
      render: (account: any) => (
        <Badge variant={account.status === 'active' ? 'green' : 'red'}>
          {account.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Fecha de Creación',
      render: (account: any) => new Date(account.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (account: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            Ver
          </Button>
          <Button size="sm" variant="outline">
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => suspendAccount(account.id)}
          >
            {account.status === 'active' ? 'Suspender' : 'Activar'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de empresas clientes
          </p>
        </div>
        <Button>Crear Account</Button>
      </div>

      <DataTable
        data={accounts}
        columns={columns}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pagination
      />
    </div>
  );
};
```

### 3. Configuración de Modelos LLM

```typescript
// pages/System/LLMModels.tsx
import React, { useState } from 'react';
import { useSystem } from '../../hooks/useSystem';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const LLMModels: React.FC = () => {
  const { llmModels, loading, addModel, updateModel, deleteModel } = useSystem();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddModel = async (modelData: any) => {
    await addModel(modelData);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modelos LLM</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de modelos de IA disponibles
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Agregar Modelo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {llmModels.map((model) => (
          <Card key={model.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
              <Badge variant={model.isActive ? 'green' : 'gray'}>
                {model.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Proveedor:</strong> {model.provider}</p>
              <p><strong>ID:</strong> {model.id}</p>
              <p><strong>Max Tokens:</strong> {model.maxTokens.toLocaleString()}</p>
              <p><strong>Costo por Token:</strong> ${model.costPerToken}</p>
              <p><strong>Disponible:</strong> {model.isAvailable ? 'Sí' : 'No'}</p>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button size="sm" variant="outline">
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateModel(model.id, { isActive: !model.isActive })}
              >
                {model.isActive ? 'Desactivar' : 'Activar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteModel(model.id)}
              >
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showAddForm && (
        <LLMModelForm
          onSubmit={handleAddModel}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};
```

### 4. Analytics Avanzados

```typescript
// pages/Analytics/Analytics.tsx
import React, { useState } from 'react';
import { RevenueChart } from './RevenueChart';
import { UsageChart } from './UsageChart';
import { PerformanceChart } from './PerformanceChart';
import { UserAnalytics } from './UserAnalytics';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Métricas y análisis del sistema
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart timeRange={timeRange} />
        <UsageChart timeRange={timeRange} />
      </div>

      <PerformanceChart timeRange={timeRange} />
      <UserAnalytics timeRange={timeRange} />
    </div>
  );
};
```

### 5. Monitoreo del Sistema

```typescript
// pages/Monitoring/SystemHealth.tsx
import React, { useState, useEffect } from 'react';
import { useMonitoring } from '../../hooks/useMonitoring';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';

export const SystemHealth: React.FC = () => {
  const { systemHealth, loading } = useMonitoring();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Refrescar datos cada 30 segundos
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Salud del Sistema</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Auto-refresh</label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">CPU</h3>
            <Badge variant={systemHealth.cpu < 80 ? 'green' : 'red'}>
              {systemHealth.cpu}%
            </Badge>
          </div>
          <Progress value={systemHealth.cpu} className="mt-2" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Memoria</h3>
            <Badge variant={systemHealth.memory < 80 ? 'green' : 'red'}>
              {systemHealth.memory}%
            </Badge>
          </div>
          <Progress value={systemHealth.memory} className="mt-2" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Disco</h3>
            <Badge variant={systemHealth.disk < 80 ? 'green' : 'red'}>
              {systemHealth.disk}%
            </Badge>
          </div>
          <Progress value={systemHealth.disk} className="mt-2" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Red</h3>
            <Badge variant={systemHealth.network < 80 ? 'green' : 'red'}>
              {systemHealth.network}%
            </Badge>
          </div>
          <Progress value={systemHealth.network} className="mt-2" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Servicios</h3>
          <div className="space-y-3">
            {systemHealth.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{service.name}</span>
                <Badge variant={service.status === 'running' ? 'green' : 'red'}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Base de Datos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conexiones activas</span>
              <span className="text-sm font-medium">{systemHealth.database.connections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo de respuesta</span>
              <span className="text-sm font-medium">{systemHealth.database.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado</span>
              <Badge variant={systemHealth.database.status === 'healthy' ? 'green' : 'red'}>
                {systemHealth.database.status}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

## 🔧 Configuración de Despliegue

### Configuración de Producción para Admin Dashboard

```bash
# Construir aplicación
cd apps/admin-dashboard
npm run build

# Servir con servidor web (nginx, apache, etc.)
# Los archivos están en dist/
# Configurar proxy para API en /api/v1/*
# Variables de entorno:
# - VITE_API_URL=http://localhost:3001
# - VITE_ADMIN_MODE=true
```

### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name admin.yourapp.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name app.yourapp.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Características Principales

### 1. **Gestión de Modelos LLM**

- Agregar nuevos modelos fácilmente
- Configurar costos y límites
- Activar/desactivar modelos
- Monitorear uso y rendimiento

### 2. **Analytics Avanzados**

- Métricas de ingresos
- Uso de recursos
- Rendimiento del sistema
- Análisis de usuarios

### 3. **Monitoreo en Tiempo Real**

- Salud del sistema
- Métricas de rendimiento
- Alertas automáticas
- Logs del sistema

### 4. **Gestión de Accounts**

- Crear/editar/eliminar accounts
- Suspender/activar cuentas
- Gestión de facturación
- Monitoreo de uso

### 5. **Seguridad**

- Control de acceso basado en roles
- Auditoría de acciones
- Gestión de API keys
- Monitoreo de seguridad

### 6. **Soporte**

- Tickets de soporte
- Base de conocimiento
- FAQ
- Chat en vivo

## 🔐 Seguridad y Acceso

### Autenticación de Administradores

```typescript
// services/auth.service.ts
export class AdminAuthService {
  async loginAdmin(email: string, password: string, twoFactorCode?: string) {
    // Verificar credenciales
    const admin = await this.validateAdminCredentials(email, password);

    // Verificar 2FA si está habilitado
    if (admin.twoFactorEnabled && !twoFactorCode) {
      throw new Error("Two-factor authentication required");
    }

    if (admin.twoFactorEnabled && twoFactorCode) {
      const isValid = await this.verifyTwoFactor(admin.id, twoFactorCode);
      if (!isValid) {
        throw new Error("Invalid two-factor code");
      }
    }

    // Generar JWT token
    const token = this.generateAdminToken(admin);

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }
}
```

### Middleware de Autorización

```typescript
// middleware/admin-auth.middleware.ts
@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const payload = this.jwtService.verify(token);

      // Verificar que es un token de administrador
      if (payload.type !== "admin") {
        return res.status(403).json({ error: "Invalid token type" });
      }

      req["admin"] = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }
}
```

Este dashboard de administración proporciona control total sobre el SaaS, permitiendo gestionar modelos LLM, monitorear el sistema, y administrar accounts de manera eficiente y segura.
