import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { mockBillingData, simulateNetworkDelay } from '../lib/mock-data';
import { useAppStore } from '../store/appStore';

// Interfaces
export interface BillingData {
  currentBalance: number;
  creditLimit: number;
  lastPayment: {
    amount: number;
    date: string;
    method: string;
  } | null;
  nextPayment: {
    amount: number;
    date: string;
  } | null;
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
  elevenLabsUsage: {
    minutesUsed: number;
    tokensUsed: number;
    callsMade: number;
    totalCost: number;
    thisMonth: number;
    lastMonth: number;
  };
  account: {
    id: string;
    name: string;
    email: string;
    subscriptionPlan: string;
    createdAt: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  brand: string;
  isDefault: boolean;
}

// Hook principal para billing
export const useBilling = () => {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  // Obtener información de balance
  const { data: billingData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ['billing', 'balance'],
    queryFn: async () => {
      try {
        return await apiClient.get<{ data: BillingData }>('/billing/balance');
      } catch (error) {
        if (error instanceof Error && error.message.includes("Servidor no disponible")) {
          console.log("🔄 Usando datos de billing de demostración...");
          await simulateNetworkDelay();
          return { data: mockBillingData };
        }
        throw error;
      }
    },
    refetchInterval: false, // No recargar automáticamente
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutos (más tiempo para evitar recargas)
    gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
    refetchOnWindowFocus: false, // Evitar recargas automáticas
    refetchOnMount: false, // No recargar al montar si hay datos en cache
    refetchOnReconnect: false, // No recargar automáticamente al reconectar
  });

  // Obtener métodos de pago
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['billing', 'payment-methods'],
    queryFn: async () => {
      try {
        return await apiClient.get<PaymentMethod[]>('/billing/payment-methods');
      } catch (error) {
        if (error instanceof Error && error.message.includes("Servidor no disponible")) {
          console.log("🔄 Usando métodos de pago de demostración...");
          await simulateNetworkDelay();
          return mockBillingData.paymentMethods;
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (más tiempo para evitar recargas)
    gcTime: 15 * 60 * 1000, // 15 minutos de garbage collection
    refetchOnWindowFocus: false, // Evitar recargas automáticas
    refetchOnMount: false, // No recargar al montar si hay datos en cache
    refetchOnReconnect: false, // No recargar automáticamente al reconectar
  });

  // Agregar fondos
  const addFunds = useMutation({
    mutationFn: (data: { amount: number; paymentMethodId: string }) => 
      apiClient.post('/billing/add-funds', data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Fondos agregados',
        message: 'Los fondos se han agregado exitosamente a tu cuenta',
      });
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error al agregar fondos',
        message: error.message || 'No se pudieron agregar los fondos',
      });
    },
  });

  // Utilidades
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBalanceStatus = () => {
    if (!billingData?.data) return 'unknown';
    
    const percentage = ((billingData.data as any).currentBalance / (billingData.data as any).creditLimit) * 100;
    if (percentage < 10) return 'critical';
    if (percentage < 25) return 'warning';
    if (percentage < 50) return 'low';
    return 'good';
  };

  const getBalanceColor = () => {
    const status = getBalanceStatus();
    switch (status) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      case 'good': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getMinutesStatus = () => {
    if (!(billingData as any)?.elevenLabsUsage) return 'unknown';
    
    // Calcular porcentaje basado en el balance disponible vs costo de minutos
    const costPerMinute = 0.08; // Costo promedio por minuto de ElevenLabs
    const maxMinutesFromBalance = (billingData as any).currentBalance / costPerMinute;
    const percentage = ((billingData as any).elevenLabsUsage.minutesUsed / maxMinutesFromBalance) * 100;
    
    if (percentage > 90) return 'critical';
    if (percentage > 75) return 'warning';
    if (percentage > 50) return 'low';
    return 'good';
  };

  const getMinutesColor = () => {
    const status = getMinutesStatus();
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      case 'good': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return {
    // Datos
    billingData: billingData?.data as any,
    paymentMethods,
    
    // Estados de carga
    balanceLoading,
    paymentMethodsLoading,
    balanceError,
    
    // Mutaciones
    addFunds,
    
    // Utilidades
    formatCurrency,
    formatDate,
    getBalanceStatus,
    getBalanceColor,
    getMinutesStatus,
    getMinutesColor,
  };
};
