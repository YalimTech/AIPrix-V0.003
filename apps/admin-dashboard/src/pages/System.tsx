import React, { useState } from "react";
import {
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const System: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const systemStats = [
    {
      name: "CPU Usage",
      value: "45%",
      status: "healthy",
      icon: CpuChipIcon,
    },
    {
      name: "Memory Usage",
      value: "67%",
      status: "warning",
      icon: ServerIcon,
    },
    {
      name: "Disk Usage",
      value: "23%",
      status: "healthy",
      icon: CircleStackIcon,
    },
    {
      name: "Network I/O",
      value: "12%",
      status: "healthy",
      icon: ServerIcon,
    },
  ];

  const services = [
    {
      name: "API Server",
      status: "running",
      uptime: "99.9%",
      lastRestart: "2024-09-15",
    },
    {
      name: "Database",
      status: "running",
      uptime: "99.8%",
      lastRestart: "2024-09-10",
    },
    {
      name: "Redis Cache",
      status: "running",
      uptime: "99.7%",
      lastRestart: "2024-09-20",
    },
    {
      name: "WebSocket",
      status: "running",
      uptime: "99.6%",
      lastRestart: "2024-09-18",
    },
    {
      name: "Background Jobs",
      status: "warning",
      uptime: "98.5%",
      lastRestart: "2024-09-25",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
      case "stopped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "error":
      case "stopped":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "services", name: "Services" },
    { id: "logs", name: "Logs" },
    { id: "settings", name: "Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System</h1>
        <p className="mt-1 text-sm text-gray-500">
          System monitoring and configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                          <div className="ml-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stat.status)}`}
                            >
                              {getStatusIcon(stat.status)}
                              <span className="ml-1">{stat.status}</span>
                            </span>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Health Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Health
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">System Health Chart</p>
                <p className="text-sm text-gray-400">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {selectedTab === "services" && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Services Status
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Restart
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}
                      >
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{service.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.uptime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.lastRestart}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900 mr-3">
                        Restart
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {selectedTab === "logs" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Logs
          </h3>
          <div className="h-96 bg-gray-900 rounded-lg p-4 overflow-y-auto">
            <pre className="text-green-400 text-sm font-mono">
              <div>
                [2024-09-29 10:45:12] INFO: API Server started on port 3001
              </div>
              <div>
                [2024-09-29 10:45:13] INFO: Database connection established
              </div>
              <div>[2024-09-29 10:45:14] INFO: Redis cache connected</div>
              <div>[2024-09-29 10:45:15] INFO: WebSocket server started</div>
              <div>
                [2024-09-29 10:45:16] INFO: Background job processor started
              </div>
              <div>
                [2024-09-29 10:45:17] INFO: All services running successfully
              </div>
              <div>
                [2024-09-29 10:46:23] INFO: New account registration: TechCorp
              </div>
              <div>
                [2024-09-29 10:47:15] INFO: User login: john@techcorp.com
              </div>
              <div>
                [2024-09-29 10:48:42] WARN: High CPU usage detected: 78%
              </div>
              <div>[2024-09-29 10:49:01] INFO: CPU usage normalized: 45%</div>
            </pre>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === "settings" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            System Settings
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Mode
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-500">
                  Enable maintenance mode
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Backup
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-500">
                  Enable automatic daily backups
                </span>
              </div>
            </div>
            <div className="pt-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default System;
