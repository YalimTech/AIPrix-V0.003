import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { CurrencyDollarIcon, CreditCardIcon, DocumentTextIcon, CalendarIcon, ArrowDownTrayIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon, } from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";
import { useAppStore } from "../store/appStore";
import Button from "../components/ui/Button";
import { AutoRefillModal } from "../components/modals";
const BillingPage = () => {
    const [activeTab, setActiveTab] = useState("overview");
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
    const { data: billingInfo, isLoading: billingLoading, error: billingError, } = useQuery({
        queryKey: ["billing-info"],
        queryFn: () => apiClient.get(endpoints.billing.balance),
        refetchInterval: 30000,
    });
    // Fetch payment methods
    const { data: paymentMethods, isLoading: paymentMethodsLoading, error: paymentMethodsError, } = useQuery({
        queryKey: ["payment-methods"],
        queryFn: () => apiClient.get(endpoints.billing.paymentMethods),
    });
    // Fetch transactions
    const { data: transactions, isLoading: transactionsLoading, error: transactionsError, } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => apiClient.get(endpoints.billing.history),
    });
    // Fetch invoices
    const { data: invoices, isLoading: invoicesLoading, error: invoicesError, } = useQuery({
        queryKey: ["invoices"],
        queryFn: () => apiClient.get("/billing/invoices"),
    });
    const addFunds = useMutation({
        mutationFn: (data) => apiClient.post(endpoints.billing.addFunds, data),
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
        onError: (error) => {
            addNotification({
                type: "error",
                title: "Error al agregar fondos",
                message: error.message || "No se pudieron agregar los fondos",
            });
        },
    });
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const getStatusColor = (status) => {
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
    const getTypeIcon = (type) => {
        switch (type) {
            case "charge":
                return _jsx(CurrencyDollarIcon, { className: "w-4 h-4 text-red-600" });
            case "payment":
                return _jsx(CheckCircleIcon, { className: "w-4 h-4 text-green-600" });
            case "refund":
                return _jsx(ExclamationTriangleIcon, { className: "w-4 h-4 text-blue-600" });
            default:
                return _jsx(CurrencyDollarIcon, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getTypeText = (type) => {
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
    const getCardBrandIcon = (brand) => {
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
        return (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-300 rounded w-1/3 mb-6" }), _jsx("div", { className: "h-64 bg-gray-300 rounded" })] }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Facturaci\u00F3n" }), _jsx("p", { className: "text-gray-600", children: "Gestiona tu balance, m\u00E9todos de pago y historial de transacciones" })] }), _jsx("div", { className: "border-b border-gray-200 mb-8", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { children: tab.name })] }, tab.id));
                    }) }) }), activeTab === "overview" && billingInfo && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(CurrencyDollarIcon, { className: "w-8 h-8 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Balance actual" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(billingInfo.currentBalance) })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(DocumentTextIcon, { className: "w-8 h-8 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Usado este mes" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(billingInfo.usage.thisMonth) })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(CalendarIcon, { className: "w-8 h-8 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Pr\u00F3ximo pago" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(billingInfo.nextPayment?.amount || 0) })] })] }) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Uso mensual" }), _jsxs("div", { className: "grid grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Mes actual" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: formatCurrency(billingInfo.usage.thisMonth) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Mes pasado" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: formatCurrency(billingInfo.usage.lastMonth) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Proyectado" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: formatCurrency(billingInfo.usage.projected) })] })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600 mb-2", children: [_jsx("span", { children: "Uso del l\u00EDmite de cr\u00E9dito" }), _jsxs("span", { children: [((billingInfo.currentBalance / billingInfo.creditLimit) *
                                                        100).toFixed(1), "%"] })] }), _jsx("div", { className: "w-full h-2 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all duration-300 ${(billingInfo.currentBalance / billingInfo.creditLimit) *
                                                100 >
                                                80
                                                ? "bg-red-500"
                                                : (billingInfo.currentBalance / billingInfo.creditLimit) *
                                                    100 >
                                                    50
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"}`, style: {
                                                width: `${Math.min((billingInfo.currentBalance / billingInfo.creditLimit) * 100, 100)}%`,
                                            } }) })] })] }), billingInfo.autoRefill.enabled && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-green-900", children: "Auto-refill activo" }), _jsxs("p", { className: "text-sm text-green-700", children: ["Se recargar\u00E1 ", formatCurrency(billingInfo.autoRefill.amount), " ", "cuando el balance est\u00E9 por debajo de", " ", formatCurrency(billingInfo.autoRefill.threshold)] })] }), _jsx(Button, { onClick: () => setShowAutoRefill(true), variant: "outline", size: "sm", children: "Configurar" })] }) })), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Acciones r\u00E1pidas" }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs(Button, { onClick: () => setShowAddFunds(true), variant: "primary", className: "flex items-center", children: [_jsx(PlusIcon, { className: "w-4 h-4 mr-2" }), "Agregar fondos"] }), _jsxs(Button, { onClick: () => setShowAutoRefill(true), variant: "outline", className: "flex items-center", children: [_jsx(CurrencyDollarIcon, { className: "w-4 h-4 mr-2" }), "Configurar auto-refill"] }), _jsxs(Button, { onClick: () => window.open("/billing/invoices", "_blank"), variant: "outline", className: "flex items-center", children: [_jsx(ArrowDownTrayIcon, { className: "w-4 h-4 mr-2" }), "Descargar facturas"] })] })] })] })), activeTab === "transactions" && (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Historial de transacciones" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "table-header", children: "Tipo" }), _jsx("th", { className: "table-header", children: "Descripci\u00F3n" }), _jsx("th", { className: "table-header", children: "Monto" }), _jsx("th", { className: "table-header", children: "Fecha" }), _jsx("th", { className: "table-header", children: "Estado" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: transactionsLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "table-cell text-center", children: _jsx("div", { className: "animate-pulse", children: "Cargando transacciones..." }) }) })) : transactions?.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "table-cell text-center text-gray-500", children: "No hay transacciones disponibles" }) })) : (transactions?.map((transaction) => (_jsxs("tr", { className: "table-row-hover", children: [_jsx("td", { className: "table-cell", children: _jsxs("div", { className: "flex items-center", children: [getTypeIcon(transaction.type), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-900", children: getTypeText(transaction.type) })] }) }), _jsx("td", { className: "table-cell", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: transaction.description }), transaction.reference && (_jsxs("p", { className: "text-xs text-gray-500", children: ["Ref: ", transaction.reference] }))] }) }), _jsx("td", { className: "table-cell", children: _jsxs("span", { className: `text-sm font-medium ${transaction.type === "charge"
                                                        ? "text-red-600"
                                                        : "text-green-600"}`, children: [transaction.type === "charge" ? "-" : "+", formatCurrency(transaction.amount)] }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "text-sm text-gray-900", children: formatDateTime(transaction.date) }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`, children: transaction.status }) })] }, transaction.id)))) })] }) })] })), activeTab === "invoices" && (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Facturas" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "table-header", children: "N\u00FAmero" }), _jsx("th", { className: "table-header", children: "Fecha" }), _jsx("th", { className: "table-header", children: "Vencimiento" }), _jsx("th", { className: "table-header", children: "Monto" }), _jsx("th", { className: "table-header", children: "Estado" }), _jsx("th", { className: "table-header", children: "Acciones" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: invoicesLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "table-cell text-center", children: _jsx("div", { className: "animate-pulse", children: "Cargando facturas..." }) }) })) : invoices?.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "table-cell text-center text-gray-500", children: "No hay facturas disponibles" }) })) : (invoices?.map((invoice) => (_jsxs("tr", { className: "table-row-hover", children: [_jsx("td", { className: "table-cell", children: _jsx("span", { className: "text-sm font-medium text-gray-900", children: invoice.number }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "text-sm text-gray-900", children: formatDate(invoice.date) }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "text-sm text-gray-900", children: formatDate(invoice.dueDate) }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "text-sm font-medium text-gray-900", children: formatCurrency(invoice.amount) }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`, children: invoice.status }) }), _jsx("td", { className: "table-cell", children: _jsxs(Button, { onClick: () => window.open(invoice.downloadUrl, "_blank"), variant: "outline", size: "sm", className: "flex items-center", children: [_jsx(ArrowDownTrayIcon, { className: "w-4 h-4 mr-1" }), "Descargar"] }) })] }, invoice.id)))) })] }) })] })), activeTab === "payment-methods" && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "M\u00E9todos de pago" }), _jsxs(Button, { variant: "primary", className: "flex items-center", children: [_jsx(PlusIcon, { className: "w-4 h-4 mr-2" }), "Agregar m\u00E9todo"] })] }), paymentMethodsLoading ? (_jsx("div", { className: "animate-pulse space-y-4", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-16 bg-gray-300 rounded" }, i))) })) : paymentMethods?.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CreditCardIcon, { className: "w-8 h-8 text-gray-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-500", children: "No tienes m\u00E9todos de pago configurados" })] })) : (_jsx("div", { className: "space-y-4", children: paymentMethods?.map((method) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-2xl", children: getCardBrandIcon(method.brand) }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [method.brand.toUpperCase(), " \u2022\u2022\u2022\u2022 ", method.lastFour] }), method.expiryMonth && method.expiryYear && (_jsxs("p", { className: "text-xs text-gray-500", children: ["Expira", " ", method.expiryMonth.toString().padStart(2, "0"), "/", method.expiryYear] }))] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [method.isDefault && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "Predeterminado" })), _jsx(Button, { variant: "outline", size: "sm", children: "Editar" }), _jsx(Button, { variant: "outline", size: "sm", children: "Eliminar" })] })] }) }, method.id))) }))] }) })), showAddFunds && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Agregar Fondos" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Monto" }), _jsx("div", { className: "grid grid-cols-4 gap-2 mb-3", children: [25, 50, 100, 200].map((amountOption) => (_jsx("button", { onClick: () => setAmount(amountOption), className: `px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${amount === amountOption
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`, children: formatCurrency(amountOption) }, amountOption))) }), _jsx("input", { type: "number", min: "10", max: "1000", step: "10", value: amount, onChange: (e) => setAmount(parseFloat(e.target.value) || 0), className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "M\u00E9todo de pago" }), _jsxs("select", { value: selectedPaymentMethod, onChange: (e) => setSelectedPaymentMethod(e.target.value), className: "input-field", children: [_jsx("option", { value: "", children: "Seleccionar m\u00E9todo" }), paymentMethods?.map((method) => (_jsxs("option", { value: method.id, children: [method.brand.toUpperCase(), " \u2022\u2022\u2022\u2022 ", method.lastFour] }, method.id)))] })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx(Button, { onClick: () => setShowAddFunds(false), variant: "outline", className: "flex-1", children: "Cancelar" }), _jsx(Button, { onClick: handleAddFunds, variant: "primary", className: "flex-1", isLoading: addFunds.isPending, children: addFunds.isPending ? "Procesando..." : "Agregar" })] })] })] }) })), _jsx(AutoRefillModal, { isOpen: showAutoRefill, onClose: () => setShowAutoRefill(false), onSave: (amount) => {
                    console.log("Auto refill amount:", amount);
                    setShowAutoRefill(false);
                } })] }));
};
export default BillingPage;
