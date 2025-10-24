import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Billing: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");

  const billingStats = [
    {
      name: "Total Revenue",
      value: "$45,678",
      change: "+12.5%",
      changeType: "increase",
    },
    {
      name: "Active Subscriptions",
      value: "24",
      change: "+2",
      changeType: "increase",
    },
    {
      name: "Churn Rate",
      value: "2.1%",
      change: "-0.3%",
      changeType: "decrease",
    },
    {
      name: "ARPU",
      value: "$1,903",
      change: "+8.2%",
      changeType: "increase",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      account: "TechCorp",
      amount: "$2,990",
      plan: "Pro",
      status: "paid",
      date: "2024-09-28",
      method: "Credit Card",
    },
    {
      id: 2,
      account: "StartupXYZ",
      amount: "$1,990",
      plan: "Business",
      status: "paid",
      date: "2024-09-27",
      method: "Bank Transfer",
    },
    {
      id: 3,
      account: "Empresa ABC",
      amount: "$1,490",
      plan: "Starter",
      status: "pending",
      date: "2024-09-26",
      method: "Credit Card",
    },
    {
      id: 4,
      account: "InnovateLab",
      amount: "$1,290",
      plan: "Pro",
      status: "failed",
      date: "2024-09-25",
      method: "Credit Card",
    },
  ];

  // Filtrar transacciones
  const filteredTransactions = recentTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.plan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || transaction.status === statusFilter;
    const matchesAccount =
      !accountFilter || transaction.account === accountFilter;

    return matchesSearch && matchesStatus && matchesAccount;
  });

  // Obtener lista única de accounts para el filtro
  const uniqueAccounts = [
    ...new Set(recentTransactions.map((transaction) => transaction.account)),
  ];

  // Funciones de manejo
  const handleCreateInvoice = () => {
    console.log("Crear nueva factura");
    // Aquí iría la lógica para crear factura
  };

  const handleViewTransaction = (transactionId: number) => {
    console.log("Ver transacción:", transactionId);
    // Aquí iría la lógica para ver detalles
  };

  const handleRetryPayment = (transactionId: number) => {
    console.log("Reintentar pago:", transactionId);
    // Aquí iría la lógica para reintentar pago
  };

  const handleRefund = (transactionId: number) => {
    console.log("Procesar reembolso:", transactionId);
    // Aquí iría la lógica para procesar reembolso
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "pending":
        return <ClockIcon className="h-4 w-4" />;
      case "failed":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Revenue and subscription management
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
          <button
            onClick={handleCreateInvoice}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Crear Factura
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {billingStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
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
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Revenue Trend
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Revenue Chart</p>
            <p className="text-sm text-gray-400">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Filtros de Transacciones */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Accounts</option>
            {uniqueAccounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Estados</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transacciones Recientes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                    >
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 mr-1" />
                      {transaction.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleViewTransaction(transaction.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                      {transaction.status === "failed" && (
                        <button
                          onClick={() => handleRetryPayment(transaction.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title="Reintentar pago"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {transaction.status === "paid" && (
                        <button
                          onClick={() => handleRefund(transaction.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Procesar reembolso"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
