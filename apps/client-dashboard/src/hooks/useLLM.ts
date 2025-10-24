import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  enableRAG?: boolean;
  contextLimit?: number;
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed: number;
  cost: number;
  latency: number;
  metadata?: Record<string, any>;
}

export const useLLMModels = () => {
  return useQuery({
    queryKey: ['llm', 'models'],
    queryFn: () => apiClient.get<LLMModel[]>(endpoints.llm.models),
  });
};

export const useGenerateText = () => {
  return useMutation({
    mutationFn: (request: LLMRequest) =>
      apiClient.post<LLMResponse>(endpoints.llm.generate, request),
  });
};

export const useGenerateLLMText = () => {
  return useMutation({
    mutationFn: (request: LLMRequest) =>
      apiClient.post<{ generatedText: string }>(endpoints.llm.generate, request),
  });
};
