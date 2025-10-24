import React from "react";
import {
  BuildingOfficeIcon,
  PhoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Account {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionPlan: string;
  _count: {
    users: number;
    agents: number;
    calls: number;
  };
  revenue: number;
}

interface TopAccountsProps {
  accounts: Account[];
}

const TopAccounts: React.FC<TopAccountsProps> = ({ accounts = [] }) => {
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "pro":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Accounts Más Activos
        </h3>
        <div className="flow-root">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay accounts disponibles</p>
            </div>
          ) : (
            <ul className="-my-5 divide-y divide-gray-200">
              {accounts.map((account) => (
                <li key={account.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {account.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {account.slug}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(account.subscriptionPlan)}`}
                          >
                            {account.subscriptionPlan}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}
                          >
                            {account.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          <span>{account._count.users} usuarios</span>
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          <span>{account._count.calls} llamadas</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-green-600">
                            ${account.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6">
          <a
            href="/admin/accounts"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Ver todos los accounts
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopAccounts;
