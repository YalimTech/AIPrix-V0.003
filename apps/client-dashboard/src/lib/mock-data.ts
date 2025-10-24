// Datos de demostración para modo offline
export const mockDashboardStats = {
  totalCalls: 1247,
  activeAgents: 8,
  successfulCalls: 1156,
  failedCalls: 91,
  averageCallDuration: "4:32",
  totalRevenue: 28450.75,
  monthlyGrowth: 12.5,
  callSuccessRate: 92.7,
  agentUtilization: 78.3,
};

// Función para generar Client ID de 12 dígitos basado en el accountId
const generateMockClientId = (accountId: string): string => {
  // Usar el accountId como seed para generar un número consistente
  let hash = 0;
  for (let i = 0; i < accountId.length; i++) {
    const char = accountId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }

  // Tomar el valor absoluto y generar un número de 12 dígitos
  const num = Math.abs(hash);
  const clientId = (num % 1000000000000).toString().padStart(12, "0");
  return clientId;
};

export const mockUserInfo = {
  id: "e24e1621-4727-4102-acc9-cd44a3f62819",
  email: "user@aiprix.com",
  firstName: "Usuario",
  lastName: "Demo",
  clientId: generateMockClientId("a2504ac1-3072-4019-8d64-b1029cbe580b"),
  accountBalance: 0,
  accountStatus: "active",
  createdAt: "2024-01-15T10:30:00Z",
  accountId: "a2504ac1-3072-4019-8d64-b1029cbe580b",
  role: "user",
  account: {
    id: "a2504ac1-3072-4019-8d64-b1029cbe580b",
    name: "Empresa Demo",
    plan: "premium",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
  },
  lastLogin: new Date().toISOString(),
};

export const mockRecentActivity = [
  {
    id: "1",
    type: "call_completed",
    title: "Llamada completada",
    description: "Llamada exitosa a cliente potencial - 5:23 min",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metadata: {
      duration: "5:23",
      success: true,
      agent: "Agente Alpha",
    },
  },
  {
    id: "2",
    type: "agent_created",
    title: "Nuevo agente creado",
    description: "Agente 'Ventas Beta' configurado exitosamente",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    metadata: {
      agentName: "Ventas Beta",
      voice: "español-femenino",
    },
  },
  {
    id: "3",
    type: "campaign_started",
    title: "Campaña iniciada",
    description: "Campaña 'Q1 2025' iniciada con 150 contactos",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    metadata: {
      campaignName: "Q1 2025",
      contactCount: 150,
    },
  },
  {
    id: "4",
    type: "integration_connected",
    title: "Integración conectada",
    description: "CRM Salesforce conectado exitosamente",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    metadata: {
      integration: "Salesforce",
      status: "connected",
    },
  },
  {
    id: "5",
    type: "payment_received",
    title: "Pago recibido",
    description: "Pago de $299.00 procesado exitosamente",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    metadata: {
      amount: 299.0,
      currency: "USD",
      plan: "premium",
    },
  },
];

export const mockIntegrationsStatus = {
  salesforce: {
    connected: true,
    name: "Salesforce CRM",
    lastSync: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "active",
  },
  hubspot: {
    connected: false,
    name: "HubSpot",
    lastSync: null,
    status: "disconnected",
  },
  zapier: {
    connected: true,
    name: "Zapier",
    lastSync: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: "active",
  },
  webhook: {
    connected: true,
    name: "Webhook Personalizado",
    lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "active",
  },
};

export const mockDashboardIntegrationsStatus = {
  status: {
    twilio: true, // ✅ Configurado en BD - FUNCIONA
    elevenLabs: false, // ❌ No configurado en .env - NO FUNCIONA
    goHighLevel: true, // ✅ Configurado en BD - FUNCIONA REALMENTE
  },
  lastChecked: new Date().toISOString(),
  // ACTUALIZADO: Verificado que GoHighLevel SÍ funciona con conexión real
  // Las credenciales están en BD y la conexión es exitosa
};

export const mockBillingData = {
  balance: 28450.75,
  currency: "USD",
  paymentMethods: [
    {
      id: "pm_1234567890",
      type: "card",
      last4: "4242",
      brand: "visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ],
  subscription: {
    plan: "premium",
    status: "active",
    currentPeriodStart: "2024-12-01T00:00:00Z",
    currentPeriodEnd: "2025-01-01T00:00:00Z",
    amount: 299.0,
    currency: "USD",
  },
  invoices: [
    {
      id: "inv_001",
      amount: 299.0,
      currency: "USD",
      status: "paid",
      date: "2024-12-01T00:00:00Z",
      description: "Plan Premium - Diciembre 2024",
    },
    {
      id: "inv_002",
      amount: 299.0,
      currency: "USD",
      status: "paid",
      date: "2024-11-01T00:00:00Z",
      description: "Plan Premium - Noviembre 2024",
    },
  ],
};

// Función para simular delay de red
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
