import React from "react";
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

interface GrowthMetricsProps {
  metrics: {
    accountGrowth: {
      current: number;
      previous: number;
      percentage: number;
    };
    userGrowth: {
      current: number;
      previous: number;
      percentage: number;
    };
    revenueGrowth: {
      current: number;
      previous: number;
      percentage: number;
    };
    callGrowth: {
      current: number;
      previous: number;
      percentage: number;
    };
  };
}

const GrowthMetrics: React.FC<GrowthMetricsProps> = ({ metrics }) => {
  const metricCards = [
    {
      name: "Crecimiento de Accounts",
      current: metrics.accountGrowth.current,
      previous: metrics.accountGrowth.previous,
      percentage: metrics.accountGrowth.percentage,
      icon: ChartBarIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Crecimiento de Usuarios",
      current: metrics.userGrowth.current,
      previous: metrics.userGrowth.previous,
      percentage: metrics.userGrowth.percentage,
      icon: ChartBarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Crecimiento de Ingresos",
      current: metrics.revenueGrowth.current,
      previous: metrics.revenueGrowth.previous,
      percentage: metrics.revenueGrowth.percentage,
      icon: ChartBarIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Crecimiento de Llamadas",
      current: metrics.callGrowth.current,
      previous: metrics.callGrowth.previous,
      percentage: metrics.callGrowth.percentage,
      icon: ChartBarIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.percentage >= 0;
        const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

        return (
          <div
            key={metric.name}
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
                    {metric.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.current.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${isPositive ? "bg-green-400" : "bg-red-400"}`}
                ></div>
                <div
                  className={`flex items-center space-x-1 text-sm font-semibold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="w-3 h-3" />
                  <span>{Math.abs(metric.percentage)}%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Anterior: {metric.previous.toLocaleString()}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "↗ Creciendo" : "↘ Decreciendo"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GrowthMetrics;
