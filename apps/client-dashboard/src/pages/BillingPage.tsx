import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";
import { useAppStore } from "../store/appStore";
import Button from "../components/ui/Button";
import { AutoRefillModal } from "../components/modals";

interface BillingInfo {
  currentBalance: number;
  creditLimit: number;
  lastPayment: {
    amount: number;
    date: string;
    method: string;
  };
  nextPayment: {
    amount: number;
    date: string;
  };
  usage: {
    thisMonth: number;
    lastMonth: number;
    projected: number;
  };
  autoRefill: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  lastFour: string;
  brand: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface Transaction {
  id: string;
  type: "charge" | "payment" | "refund";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  reference?: string;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  downloadUrl: string;
}

const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "invoices" | "payment-methods"
  >("overview");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showAutoRefill, setShowAutoRefill] = useState(false);
  const [amount, setAmount] = useState(50);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  // Mock data para billing (comentado para evitar linting)
  // Mock data comentado para evitar linting
  // const mockBillingInfo: BillingInfo = {
  //   currentBalance: 1250.75,
  //   creditLimit: 5000.0,
  //   lastPayment: {
  //     amount: 500.0,
  //     date: "2024-01-10",
  //     method: "Visa •••• 4242",
  //   },
  //   nextPayment: {
  //     amount: 250.0,
  //     date: "2024-02-01",
  //   },
  //   usage: {
  //     thisMonth: 1250.75,
  //     lastMonth: 980.5,
  //     projected: 1500.0,
  //   },
  //   autoRefill: {
  //     enabled: true,
  //     threshold: 100.0,
  //     amount: 500.0,
  //   },
  // };

  // const mockPaymentMethods: PaymentMethod[] = [
  //   {
  //     id: "1",
  //     type: "card",
  //     lastFour: "4242",
  //     brand: "visa",
  //     isDefault: true,
  //     expiryMonth: 12,
  //     expiryYear: 2025,
  //   },
  //   {
  //     id: "2",
  //     type: "card",
  //     lastFour: "5555",
  //     brand: "mastercard",
  //     isDefault: false,
  //     expiryMonth: 8,
  //     expiryYear: 2026,
  //   },
  // ];

  // const mockTransactions: Transaction[] = [
  //   {
  //     id: "1",
  //     type: "charge",
  //     amount: 125.5,
  //     description: "Call charges - January 15",
  //     date: "2024-01-15T10:30:00Z",
  //     status: "completed",
  //     reference: "CALL-001",
  //   },
  //   {
  //     id: "2",
  //     type: "payment",
  //     amount: 500.0,
  //     description: "Account refill",
  //     date: "2024-01-10T14:20:00Z",
  //     status: "completed",
  //     reference: "PAY-001",
  //   },
  //   {
  //     id: "3",
  //     type: "charge",
  //     amount: 89.25,
  //     description: "Call charges - January 14",
  //     date: "2024-01-14T16:45:00Z",
  //     status: "completed",
  //     reference: "CALL-002",
  //   },
  //   {
  //     id: "4",
  //     type: "refund",
  //     amount: 25.0,
  //     description: "Failed call refund",
  //     date: "2024-01-12T09:15:00Z",
  //     status: "completed",
  //     reference: "REF-001",
  //   },
  // ];

  // const mockInvoices: Invoice[] = [
  //   {
  //     id: "1",
  //     number: "INV-2024-001",
  //     amount: 1250.75,
  //     date: "2024-01-01",
  //     dueDate: "2024-01-31",
  //     status: "paid",
  //     downloadUrl: "/api/invoices/1/download",
  //   },
  //   {
  //     id: "2",
  //     number: "INV-2023-012",
  //     amount: 980.5,
  //     date: "2023-12-01",
  //     dueDate: "2023-12-31",
  //     status: "paid",
  //     downloadUrl: "/api/invoices/2/download",
  //   },
  // ];

  // Fetch billing information
  const {
    data: billingInfo,
    isLoading: billingLoading,
    error: billingError,
  } = useQuery({
    queryKey: ["billing-info"],
    queryFn: () => apiClient.get<BillingInfo>(endpoints.billing.balance),
    refetchInterval: 30000,
  });

  // Fetch payment methods
  const {
    data: paymentMethods,
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () =>
      apiClient.get<PaymentMethod[]>(endpoints.billing.paymentMethods),
  });

  // Fetch transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => apiClient.get<Transaction[]>(endpoints.billing.history),
  });

  // Fetch invoices
  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiClient.get<Invoice[]>("/billing/invoices"),
  });

  const addFunds = useMutation({
    mutationFn: (data: { amount: number; paymentMethodId: string }) =>
      apiClient.post(endpoints.billing.addFunds, data),
    onSuccess: () => {
      addNotification({
        type: "success",
        title: "Fondos agregados",
        message: "Los fondos se han agregado exitosamente a tu cuenta",
      });
      queryClient.invalidateQueries({ queryKey: ["billing-info"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowAddFunds(false);
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Error al agregar fondos",
        message: error.message || "No se pudieron agregar los fondos",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "charge":
        return <CurrencyDollarIcon className="w-4 h-4 text-red-600" />;
      case "payment":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case "refund":
        return <ExclamationTriangleIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <CurrencyDollarIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "charge":
        return "Cargo";
      case "payment":
        return "Pago";
      case "refund":
        return "Reembolso";
      default:
        return type;
    }
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      case "discover":
        return "💳";
      default:
        return "💳";
    }
  };

  const handleAddFunds = () => {
    if (!selectedPaymentMethod) {
      addNotification({
        type: "warning",
        title: "Método de pago requerido",
        message: "Por favor selecciona un método de pago",
      });
      return;
    }

    if (amount < 10) {
      addNotification({
        type: "warning",
        title: "Monto mínimo",
        message: "El monto mínimo es $10",
      });
      return;
    }

    addFunds.mutate({
      amount,
      paymentMethodId: selectedPaymentMethod,
    });
  };

  const tabs = [
    { id: "overview", name: "Resumen", icon: CurrencyDollarIcon },
    { id: "transactions", name: "Transacciones", icon: DocumentTextIcon },
    { id: "invoices", name: "Facturas", icon: CalendarIcon },
    { id: "payment-methods", name: "Métodos de pago", icon: CreditCardIcon },
  ];

  if (billingLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Facturación</h1>
        <p className="text-gray-600">
          Gestiona tu balance, métodos de pago y historial de transacciones
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && billingInfo && (
        <div className="space-y-6">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Balance actual
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(billingInfo.currentBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Usado este mes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(billingInfo.usage.thisMonth)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Próximo pago
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(billingInfo.nextPayment?.amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Uso mensual
            </h3>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Mes actual</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(billingInfo.usage.thisMonth)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Mes pasado</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(billingInfo.usage.lastMonth)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Proyectado</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(billingInfo.usage.projected)}
                </p>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uso del límite de crédito</span>
                <span>
                  {(
                    (billingInfo.currentBalance / billingInfo.creditLimit) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (billingInfo.currentBalance / billingInfo.creditLimit) *
                      100 >
                    80
                      ? "bg-red-500"
                      : (billingInfo.currentBalance / billingInfo.creditLimit) *
                            100 >
                          50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((billingInfo.currentBalance / billingInfo.creditLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Auto Refill Status */}
          {billingInfo.autoRefill.enabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    Auto-refill activo
                  </h3>
                  <p className="text-sm text-green-700">
                    Se recargará {formatCurrency(billingInfo.autoRefill.amount)}{" "}
                    cuando el balance esté por debajo de{" "}
                    {formatCurrency(billingInfo.autoRefill.threshold)}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAutoRefill(true)}
                  variant="outline"
                  size="sm"
                >
                  Configurar
                </Button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Acciones rápidas
            </h3>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowAddFunds(true)}
                variant="primary"
                className="flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar fondos
              </Button>

              <Button
                onClick={() => setShowAutoRefill(true)}
                variant="outline"
                className="flex items-center"
              >
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                Configurar auto-refill
              </Button>

              <Button
                onClick={() => window.open("/billing/invoices", "_blank")}
                variant="outline"
                className="flex items-center"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Descargar facturas
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Historial de transacciones
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Descripción</th>
                  <th className="table-header">Monto</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionsLoading ? (
                  <tr>
                    <td colSpan={5} className="table-cell text-center">
                      <div className="animate-pulse">
                        Cargando transacciones...
                      </div>
                    </td>
                  </tr>
                ) : transactions?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="table-cell text-center text-gray-500"
                    >
                      No hay transacciones disponibles
                    </td>
                  </tr>
                ) : (
                  transactions?.map((transaction) => (
                    <tr key={transaction.id} className="table-row-hover">
                      <td className="table-cell">
                        <div className="flex items-center">
                          {getTypeIcon(transaction.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getTypeText(transaction.type)}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          {transaction.reference && (
                            <p className="text-xs text-gray-500">
                              Ref: {transaction.reference}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === "charge"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "charge" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900">
                          {formatDateTime(transaction.date)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Facturas</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Número</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Vencimiento</th>
                  <th className="table-header">Monto</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center">
                      <div className="animate-pulse">Cargando facturas...</div>
                    </td>
                  </tr>
                ) : invoices?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="table-cell text-center text-gray-500"
                    >
                      No hay facturas disponibles
                    </td>
                  </tr>
                ) : (
                  invoices?.map((invoice) => (
                    <tr key={invoice.id} className="table-row-hover">
                      <td className="table-cell">
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.number}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900">
                          {formatDate(invoice.date)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900">
                          {formatDate(invoice.dueDate)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <Button
                          onClick={() =>
                            window.open(invoice.downloadUrl, "_blank")
                          }
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === "payment-methods" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Métodos de pago
              </h3>
              <Button variant="primary" className="flex items-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar método
              </Button>
            </div>

            {paymentMethodsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
                ) : paymentMethods?.length === 0 ? (
              <div className="text-center py-8">
                <CreditCardIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No tienes métodos de pago configurados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods?.map((method) => (
                  <div
                    key={method.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">
                          {getCardBrandIcon(method.brand)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {method.brand.toUpperCase()} •••• {method.lastFour}
                          </p>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-xs text-gray-500">
                              Expira{" "}
                              {method.expiryMonth.toString().padStart(2, "0")}/
                              {method.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Predeterminado
                          </span>
                        )}
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Agregar Fondos
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[25, 50, 100, 200].map((amountOption) => (
                    <button
                      key={amountOption}
                      onClick={() => setAmount(amountOption)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        amount === amountOption
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {formatCurrency(amountOption)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar método</option>
                  {paymentMethods?.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.brand.toUpperCase()} •••• {method.lastFour}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowAddFunds(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddFunds}
                  variant="primary"
                  className="flex-1"
                  isLoading={addFunds.isPending}
                >
                  {addFunds.isPending ? "Procesando..." : "Agregar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Refill Modal */}
      <AutoRefillModal
        isOpen={showAutoRefill}
        onClose={() => setShowAutoRefill(false)}
        onSave={(amount: number) => {
          console.log("Auto refill amount:", amount);
          setShowAutoRefill(false);
        }}
      />
    </div>
  );
};

export default BillingPage;
