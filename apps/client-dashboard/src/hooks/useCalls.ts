import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";

export interface Call {
  id: string;
  contactName: string;
  phoneNumber: string;
  outcome: 'answered' | 'no_answer' | 'busy' | 'failed';
  direction: 'inbound' | 'outbound';
  duration: number;
  recordingUrl?: string;
  transcript?: string;
  agentId: string;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export const useCalls = (filters?: {
  contactName?: string;
  phoneNumber?: string;
  outcome?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['calls', filters],
    queryFn: () => apiClient.get<Call[]>(endpoints.calls.list),
  });
};

export const useCallLogs = () => {
  return useQuery({
    queryKey: ['calls', 'logs'],
    queryFn: () => apiClient.get<Call[]>(endpoints.calls.logs),
  });
};

export const useCreateCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (call: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post<Call>(endpoints.calls.create, call),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};

export const useUpdateCall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...call }: Partial<Call> & { id: string }) =>
      apiClient.put<Call>(endpoints.calls.update(id), call),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });
};

export const useMakeCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      agentId,
      phoneNumber,
      accountId,
    }: {
      agentId: string;
      phoneNumber: string;
      accountId: string;
    }) =>
      apiClient.post(endpoints.calls.create, {
        agentId,
        phoneNumber,
        accountId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
  });
};
