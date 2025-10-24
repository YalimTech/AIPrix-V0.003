import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { useBilling } from '../../hooks/useBilling';
import { useModal } from '../../store/modalStore';
import Button from '../ui/Button';

interface BalanceWidgetProps {
  className?: string;
}

const BalanceWidget: React.FC<BalanceWidgetProps> = ({ className = '' }) => {
  const { openModal } = useModal();
  
  const {
    billingData: balance,
    balanceLoading,
    formatCurrency,
    formatDate,
    getBalanceStatus,
  } = useBilling();

  // Calcular balance disponible de ElevenLabs
  const elevenLabsBalance = balance?.elevenLabsAccount?.subscription 
    ? balance.elevenLabsAccount.subscription.characterLimit - balance.elevenLabsAccount.subscription.characterCount
    : 0;
  
  const elevenLabsUsed = balance?.elevenLabsAccount?.subscription?.characterCount || 0;
  const elevenLabsLimit = balance?.elevenLabsAccount?.subscription?.characterLimit || 0;
  const elevenLabsPercentage = elevenLabsLimit > 0 ? (elevenLabsUsed / elevenLabsLimit) * 100 : 0;


  if (balanceLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
          <p>No se pudo cargar la información de balance</p>
        </div>
      </div>
    );
  }

  const balanceStatus = getBalanceStatus();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Balance de Cuenta</h3>
            <p className="text-sm text-gray-500">
              {balance?.account?.subscriptionPlan ? `Plan ${balance.account.subscriptionPlan}` : 'Cargando plan...'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => openModal('add-account-balance')}
          variant="primary"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowUpIcon className="w-4 h-4" />
          <span>Agregar Fondos</span>
        </Button>
      </div>

      {/* Balance Display */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(balance.currentBalance)}
          </span>
          <span className="text-sm text-gray-500">
            de {formatCurrency(balance.creditLimit)}
          </span>
        </div>
        
        {/* Balance Status Indicator */}
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${
            balanceStatus === 'critical' ? 'bg-red-500' :
            balanceStatus === 'warning' ? 'bg-yellow-500' :
            balanceStatus === 'low' ? 'bg-blue-500' :
            'bg-green-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            balanceStatus === 'critical' ? 'text-red-600' :
            balanceStatus === 'warning' ? 'text-yellow-600' :
            balanceStatus === 'low' ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {balanceStatus === 'critical' ? 'Crítico' :
             balanceStatus === 'warning' ? 'Bajo' :
             balanceStatus === 'low' ? 'Moderado' :
             'Saludable'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              balanceStatus === 'critical' ? 'bg-red-500' :
              balanceStatus === 'warning' ? 'bg-yellow-500' :
              balanceStatus === 'low' ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{
              width: `${Math.min((balance.currentBalance / (balance.creditLimit || 1)) * 100, 100)}%`
            }}
          ></div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ArrowDownIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Este Mes</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(balance.usage.thisMonth)}
          </p>
        </div>
        
        {/* ElevenLabs Balance */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Balance ElevenLabs</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {elevenLabsBalance.toLocaleString()} / {elevenLabsLimit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">caracteres</p>
            </div>
          </div>
          
          {/* Progress bar for ElevenLabs */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                elevenLabsPercentage > 90 ? 'bg-red-500' :
                elevenLabsPercentage > 75 ? 'bg-yellow-500' :
                elevenLabsPercentage > 50 ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(elevenLabsPercentage, 100)}%` }}
            />
          </div>
          
          {/* Plan tier info */}
          {balance?.elevenLabsAccount?.subscription?.tier && (
            <p className="text-xs text-gray-600">
              Plan: <span className="font-medium capitalize">{balance.elevenLabsAccount.subscription.tier}</span>
            </p>
          )}
        </div>
      </div>

      {/* Last Payment */}
      {balance.lastPayment && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Último Pago</p>
              <p className="text-sm text-gray-500">
                {formatDate(balance.lastPayment.date)} • {balance.lastPayment.method}
              </p>
            </div>
            <span className="text-sm font-semibold text-green-600">
              +{formatCurrency(balance.lastPayment.amount)}
            </span>
          </div>
        </div>
      )}

      {/* Auto Refill Status */}
      {balance.autoRefill.enabled && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">Auto-recarga activada</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Se recargará {formatCurrency(balance.autoRefill.amount)} cuando el balance baje de {formatCurrency(balance.autoRefill.threshold)}
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceWidget;