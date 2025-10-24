import React from "react";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CpuChipIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface GlobalStatsProps {
  stats: {
    totalAccounts: number;
    activeAccounts: number;
    suspendedAccounts: number;
    totalUsers: number;
    totalAgents: number;
    totalCalls: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
}

const GlobalStats: React.FC<GlobalStatsProps> = ({ stats }) => {
  const statCards = [
    {
      name: "Total Accounts",
      value: stats.totalAccounts,
      icon: BuildingOfficeIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: stats.monthlyGrowth,
      changeType: "increase",
    },
    {
      name: "Accounts Activos",
      value: stats.activeAccounts,
      icon: BuildingOfficeIcon,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: Math.round((stats.activeAccounts / stats.totalAccounts) * 100),
      changeType: "percentage",
    },
    {
      name: "Total Usuarios",
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: 12,
      changeType: "increase",
    },
    {
      name: "Agentes Activos",
      value: stats.totalAgents,
      icon: CpuChipIcon,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: 8,
      changeType: "increase",
    },
    {
      name: "Llamadas Totales",
      value: stats.totalCalls,
      icon: PhoneIcon,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      change: 15,
      changeType: "increase",
    },
    {
      name: "Ingresos Mensuales",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: 23,
      changeType: "increase",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="stat-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-sm border border-gray-200/50">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
              {stat.change && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-600">
                    {stat.changeType === "percentage"
                      ? `${stat.change}%`
                      : `+${stat.change}%`}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Último mes</span>
                <button className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors duration-200">
                  Ver detalles →
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalStats;
