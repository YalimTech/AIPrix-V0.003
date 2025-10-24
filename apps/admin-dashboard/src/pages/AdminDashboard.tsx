import React from "react";
import GlobalStats from "../components/dashboard/GlobalStats";
import TopAccounts from "../components/dashboard/TopAccounts";
import GrowthMetrics from "../components/dashboard/GrowthMetrics";
import { ChartBarIcon } from "@heroicons/react/24/outline";

// const stats = [
//   {
//     name: "Total Accounts",
//     value: "12",
//     change: "+2",
//     changeType: "positive",
//     icon: BuildingOfficeIcon,
//     color: "text-blue-600",
//   },
//   {
//     name: "Usuarios Activos",
//     value: "1,247",
//     change: "+156",
//     changeType: "positive",
//     icon: UsersIcon,
//     color: "text-green-600",
//   },
//   {
//     name: "Ingresos Mensuales",
//     value: "$24,580",
//     change: "+12.5%",
//     changeType: "positive",
//     icon: CreditCardIcon,
//     color: "text-purple-600",
//   },
//   {
//     name: "Llamadas Totales",
//     value: "45,892",
//     change: "+8.2%",
//     changeType: "positive",
//     icon: ChartBarIcon,
//     color: "text-orange-600",
//   },
// ];

const recentActivity = [
  {
    id: 1,
    type: "account_created",
    message: 'Nuevo account "Empresa ABC" creado',
    timestamp: "Hace 5 minutos",
    user: "admin@prixagent.com",
  },
  {
    id: 2,
    type: "payment_received",
    message: 'Pago recibido de "TechCorp" - $299',
    timestamp: "Hace 12 minutos",
    user: "Sistema",
  },
  {
    id: 3,
    type: "user_registered",
    message: 'Nuevo usuario registrado en "StartupXYZ"',
    timestamp: "Hace 18 minutos",
    user: "Sistema",
  },
  {
    id: 4,
    type: "system_alert",
    message: "Alto uso de CPU detectado en servidor principal",
    timestamp: "Hace 25 minutos",
    user: "Sistema",
  },
];

// Datos de ejemplo para las estadísticas globales
const globalStats = {
  totalAccounts: 12,
  activeAccounts: 10,
  suspendedAccounts: 2,
  totalUsers: 1247,
  totalAgents: 156,
  totalCalls: 45892,
  totalRevenue: 24580,
  monthlyGrowth: 15,
};

// Datos de ejemplo para métricas de crecimiento
const growthMetrics = {
  accountGrowth: {
    current: 12,
    previous: 10,
    percentage: 20,
  },
  userGrowth: {
    current: 1247,
    previous: 1091,
    percentage: 14.3,
  },
  revenueGrowth: {
    current: 24580,
    previous: 21850,
    percentage: 12.5,
  },
  callGrowth: {
    current: 45892,
    previous: 42400,
    percentage: 8.2,
  },
};

const topAccounts = [
  {
    id: "1",
    name: "TechCorp",
    slug: "techcorp",
    status: "active",
    subscriptionPlan: "pro",
    _count: { users: 45, agents: 12, calls: 1250 },
    revenue: 2990,
  },
  {
    id: "2",
    name: "StartupXYZ",
    slug: "startupxyz",
    status: "active",
    subscriptionPlan: "enterprise",
    _count: { users: 32, agents: 8, calls: 890 },
    revenue: 1990,
  },
  {
    id: "3",
    name: "Empresa ABC",
    slug: "empresa-abc",
    status: "suspended",
    subscriptionPlan: "basic",
    _count: { users: 28, agents: 5, calls: 756 },
    revenue: 1490,
  },
  {
    id: "4",
    name: "InnovateLab",
    slug: "innovatelab",
    status: "active",
    subscriptionPlan: "pro",
    _count: { users: 24, agents: 6, calls: 634 },
    revenue: 1290,
  },
  {
    id: "5",
    name: "DigitalPro",
    slug: "digitalpro",
    status: "active",
    subscriptionPlan: "basic",
    _count: { users: 19, agents: 4, calls: 512 },
    revenue: 990,
  },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard Administrativo
            </h1>
            <p className="mt-2 text-gray-600">
              Visión general del sistema y gestión de accounts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="text-sm font-medium text-gray-900">
                Hace 2 minutos
              </p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Estadísticas Globales */}
      <div className="slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Estadísticas Globales
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Sistema operativo</span>
          </div>
        </div>
        <GlobalStats stats={globalStats} />
      </div>

      {/* Métricas de Crecimiento */}
      <div className="slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Métricas de Crecimiento
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Crecimiento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Estable</span>
            </div>
          </div>
        </div>
        <GrowthMetrics metrics={growthMetrics} />
      </div>

      {/* Gráficos y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Ingresos */}
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Ingresos por Mes
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">En tiempo real</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600 font-medium">Gráfico de ingresos</p>
              <p className="text-sm text-gray-400 mt-1">Próximamente</p>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Actividad Reciente
            </h3>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50/50 to-gray-50/30 rounded-xl border border-gray-200/30 hover:bg-gray-50/80 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full mt-1 shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Accounts - Usando el nuevo componente */}
      <div className="slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Accounts por Actividad
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Activos</span>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Ver todos
            </button>
          </div>
        </div>
        <TopAccounts accounts={topAccounts} />
      </div>
    </div>
  );
};
