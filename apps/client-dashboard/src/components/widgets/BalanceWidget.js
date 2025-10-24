import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useBilling } from '../../hooks/useBilling';
import { useModal } from '../../store/modalStore';
import Button from '../ui/Button';
const BalanceWidget = ({ className = '' }) => {
    const { openModal } = useModal();
    const { billingData: balance, balanceLoading, formatCurrency, formatDate, getBalanceStatus, } = useBilling();
    // Calcular balance disponible de ElevenLabs
    const elevenLabsBalance = balance?.elevenLabsAccount?.subscription
        ? balance.elevenLabsAccount.subscription.characterLimit - balance.elevenLabsAccount.subscription.characterCount
        : 0;
    const elevenLabsUsed = balance?.elevenLabsAccount?.subscription?.characterCount || 0;
    const elevenLabsLimit = balance?.elevenLabsAccount?.subscription?.characterLimit || 0;
    const elevenLabsPercentage = elevenLabsLimit > 0 ? (elevenLabsUsed / elevenLabsLimit) * 100 : 0;
    if (balanceLoading) {
        return (_jsx("div", { className: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`, children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-4" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2 mb-4" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" })] }) }));
    }
    if (!balance) {
        return (_jsx("div", { className: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`, children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx(ExclamationTriangleIcon, { className: "w-8 h-8 mx-auto mb-2" }), _jsx("p", { children: "No se pudo cargar la informaci\u00F3n de balance" })] }) }));
    }
    const balanceStatus = getBalanceStatus();
    return (_jsxs("div", { className: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(CurrencyDollarIcon, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Balance de Cuenta" }), _jsx("p", { className: "text-sm text-gray-500", children: balance?.account?.subscriptionPlan ? `Plan ${balance.account.subscriptionPlan}` : 'Cargando plan...' })] })] }), _jsxs(Button, { onClick: () => openModal('add-account-balance'), variant: "primary", size: "sm", className: "flex items-center space-x-2", children: [_jsx(ArrowUpIcon, { className: "w-4 h-4" }), _jsx("span", { children: "Agregar Fondos" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-baseline space-x-2 mb-2", children: [_jsx("span", { className: "text-3xl font-bold text-gray-900", children: formatCurrency(balance.currentBalance) }), _jsxs("span", { className: "text-sm text-gray-500", children: ["de ", formatCurrency(balance.creditLimit)] })] }), _jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${balanceStatus === 'critical' ? 'bg-red-500' :
                                    balanceStatus === 'warning' ? 'bg-yellow-500' :
                                        balanceStatus === 'low' ? 'bg-blue-500' :
                                            'bg-green-500'}` }), _jsx("span", { className: `text-sm font-medium ${balanceStatus === 'critical' ? 'text-red-600' :
                                    balanceStatus === 'warning' ? 'text-yellow-600' :
                                        balanceStatus === 'low' ? 'text-blue-600' :
                                            'text-green-600'}`, children: balanceStatus === 'critical' ? 'Crítico' :
                                    balanceStatus === 'warning' ? 'Bajo' :
                                        balanceStatus === 'low' ? 'Moderado' :
                                            'Saludable' })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${balanceStatus === 'critical' ? 'bg-red-500' :
                                balanceStatus === 'warning' ? 'bg-yellow-500' :
                                    balanceStatus === 'low' ? 'bg-blue-500' :
                                        'bg-green-500'}`, style: {
                                width: `${Math.min((balance.currentBalance / (balance.creditLimit || 1)) * 100, 100)}%`
                            } }) })] }), _jsxs("div", { className: "space-y-4 mb-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(ArrowDownIcon, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Este Mes" })] }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: formatCurrency(balance.usage.thisMonth) })] }), _jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Balance ElevenLabs" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [elevenLabsBalance.toLocaleString(), " / ", elevenLabsLimit.toLocaleString()] }), _jsx("p", { className: "text-xs text-gray-500", children: "caracteres" })] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2", children: _jsx("div", { className: `h-full transition-all duration-300 ${elevenLabsPercentage > 90 ? 'bg-red-500' :
                                        elevenLabsPercentage > 75 ? 'bg-yellow-500' :
                                            elevenLabsPercentage > 50 ? 'bg-blue-500' :
                                                'bg-green-500'}`, style: { width: `${Math.min(elevenLabsPercentage, 100)}%` } }) }), balance?.elevenLabsAccount?.subscription?.tier && (_jsxs("p", { className: "text-xs text-gray-600", children: ["Plan: ", _jsx("span", { className: "font-medium capitalize", children: balance.elevenLabsAccount.subscription.tier })] }))] })] }), balance.lastPayment && (_jsx("div", { className: "border-t border-gray-200 pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "\u00DAltimo Pago" }), _jsxs("p", { className: "text-sm text-gray-500", children: [formatDate(balance.lastPayment.date), " \u2022 ", balance.lastPayment.method] })] }), _jsxs("span", { className: "text-sm font-semibold text-green-600", children: ["+", formatCurrency(balance.lastPayment.amount)] })] }) })), balance.autoRefill.enabled && (_jsxs("div", { className: "border-t border-gray-200 pt-4 mt-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Auto-recarga activada" })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Se recargar\u00E1 ", formatCurrency(balance.autoRefill.amount), " cuando el balance baje de ", formatCurrency(balance.autoRefill.threshold)] })] }))] }));
};
export default BalanceWidget;
