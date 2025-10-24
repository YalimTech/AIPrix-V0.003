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
export declare const useLLMModels: () => import("@tanstack/react-query").UseQueryResult<LLMModel[], Error>;
export declare const useGenerateText: () => import("@tanstack/react-query").UseMutationResult<LLMResponse, Error, LLMRequest, unknown>;
export declare const useGenerateLLMText: () => import("@tanstack/react-query").UseMutationResult<{
    generatedText: string;
}, Error, LLMRequest, unknown>;
