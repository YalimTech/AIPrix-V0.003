import React, { useState } from "react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  LockClosedIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const Security: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const securityStats = [
    {
      name: "Failed Login Attempts",
      value: "12",
      change: "-3",
      changeType: "decrease",
      icon: XCircleIcon,
    },
    {
      name: "Active Sessions",
      value: "1,234",
      change: "+45",
      changeType: "increase",
      icon: EyeIcon,
    },
    {
      name: "Security Score",
      value: "95%",
      change: "+2%",
      changeType: "increase",
      icon: ShieldCheckIcon,
    },
    {
      name: "API Rate Limit Hits",
      value: "8",
      change: "-12",
      changeType: "decrease",
      icon: LockClosedIcon,
    },
  ];

  const recentSecurityEvents = [
    {
      id: 1,
      type: "failed_login",
      message: "Failed login attempt from 192.168.1.100",
      severity: "medium",
      timestamp: "2024-09-29 10:45:12",
      user: "admin@techcorp.com",
    },
    {
      id: 2,
      type: "suspicious_activity",
      message: "Multiple failed API requests from 10.0.0.50",
      severity: "high",
      timestamp: "2024-09-29 10:42:33",
      user: "system",
    },
    {
      id: 3,
      type: "successful_login",
      message: "Successful login from 172.16.0.25",
      severity: "low",
      timestamp: "2024-09-29 10:38:45",
      user: "john@techcorp.com",
    },
    {
      id: 4,
      type: "password_change",
      message: "Password changed successfully",
      severity: "low",
      timestamp: "2024-09-29 10:35:22",
      user: "jane@startupxyz.com",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircleIcon className="h-4 w-4" />;
      case "medium":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "low":
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "events", name: "Security Events" },
    { id: "policies", name: "Security Policies" },
    { id: "audit", name: "Audit Log" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="mt-1 text-sm text-gray-500">
          Security monitoring and threat detection
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
          {/* Security Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityStats.map((stat) => {
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
                          <div
                            className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === "increase"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Security Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      SSL/TLS Enabled
                    </span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Two-Factor Auth
                    </span>
                  </div>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Rate Limiting
                    </span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">
                      Password Policy
                    </span>
                  </div>
                  <span className="text-sm text-yellow-600">Needs Review</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Firewall
                    </span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Backup Encryption
                    </span>
                  </div>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {selectedTab === "events" && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Security Events
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSecurityEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}
                      >
                        {getSeverityIcon(event.severity)}
                        <span className="ml-1">{event.severity}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {selectedTab === "policies" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Security Policies
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Requirements
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    Minimum 8 characters
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    Must contain uppercase and lowercase letters
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    Must contain numbers and special characters
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Failed Login Attempts Limit
              </label>
              <input
                type="number"
                defaultValue="5"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="pt-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <KeyIcon className="h-4 w-4 mr-2" />
                Update Policies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {selectedTab === "audit" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Log</h3>
          <div className="h-96 bg-gray-900 rounded-lg p-4 overflow-y-auto">
            <pre className="text-green-400 text-sm font-mono">
              <div>
                [2024-09-29 10:45:12] SECURITY: Failed login attempt from
                192.168.1.100
              </div>
              <div>
                [2024-09-29 10:42:33] SECURITY: Multiple failed API requests
                from 10.0.0.50
              </div>
              <div>
                [2024-09-29 10:38:45] AUTH: Successful login from 172.16.0.25
              </div>
              <div>
                [2024-09-29 10:35:22] AUTH: Password changed successfully
              </div>
              <div>[2024-09-29 10:30:15] ADMIN: System settings updated</div>
              <div>
                [2024-09-29 10:25:08] USER: New user created in account TechCorp
              </div>
              <div>
                [2024-09-29 10:20:45] API: Rate limit exceeded for IP
                203.0.113.1
              </div>
              <div>
                [2024-09-29 10:15:33] SECURITY: Suspicious activity detected
              </div>
              <div>
                [2024-09-29 10:10:22] AUTH: Session expired for user
                john@techcorp.com
              </div>
              <div>[2024-09-29 10:05:11] ADMIN: Security policies updated</div>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
