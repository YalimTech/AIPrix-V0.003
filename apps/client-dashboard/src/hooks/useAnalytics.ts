import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface AnalyticsFilters {
  agentId?: string;
  callType?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  phoneNumber?: string;
}

export interface AnalyticsData {
  // Métricas principales
  calls: number;
  minutes: number;
  spent: number;
  didNotConnect: number;
  
  // Métricas de respuesta
  answers: number;
  noAnswer: number;
  appointments: number;
  transfers: number;

  // Porcentajes calculados
  answerRate: number;
  noAnswerRate: number;
  appointmentRate: number;
  transferRate: number;

  // Datos de fuentes externas
  elevenLabsAnalytics: {
    totalConversations: number;
    activeConversations: number;
    averageDuration: number;
    successRate: number;
    totalMinutes: number;
    cost: number;
  };
  ghlMetrics: {
    totalContacts: number;
    newContacts: number;
    totalOpportunities: number;
    totalValue: number;
    conversionRate: number;
    averageDealSize: number;
    activePipelines: number;
    appointments: number;
    transfers: number;
  };
  twilioMetrics: {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    totalMinutes: number;
    totalCost: number;
    averageDuration: number;
    successRate: number;
    didNotConnect: number;
    appointments: number;
    transfers: number;
  };

  // Metadatos
  lastUpdated: string;
  filters: AnalyticsFilters;
  dataSources: {
    twilio: boolean;
    elevenLabs: boolean;
    goHighLevel: boolean;
    local: boolean;
  };
}

export const useAnalytics = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.agentId) params.append('agentId', filters.agentId);
      if (filters.callType) params.append('callType', filters.callType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.type) params.append('type', filters.type);
      if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber);

      const response = await apiClient.get(`/dashboard/analytics?${params.toString()}`);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

export const usePhoneNumbers = () => {
  return useQuery({
    queryKey: ['phoneNumbers'],
    queryFn: async () => {
      const response = await apiClient.get('/phone-numbers');
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
  });
};
