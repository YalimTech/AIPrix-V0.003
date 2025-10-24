export interface ElevenLabsAgent {
    id: string;
    name: string;
    status: "active" | "inactive" | "training";
    voiceId: string;
    language: string;
    createdAt: string;
    updatedAt: string;
    conversationConfig: {
        maxDuration: number;
        endCallPhrases: string[];
        interruptionThreshold: number;
    };
}
export interface ElevenLabsVoice {
    id: string;
    name: string;
    category: string;
    description: string;
    labels: Record<string, string>;
    previewUrl: string;
    availableForTts: boolean;
    settings?: any;
    languages?: string[];
    isMultilingual?: boolean;
    audioPreviewUrl?: string;
    languageCapabilities?: {
        native: string[];
        supported: string[];
        multilingual: boolean;
        verifiedLanguages?: any[];
    };
    isConversationOptimized?: boolean;
    selectedLanguage?: string;
    isFallbackForLanguage?: boolean;
    isEnglishVoiceForOtherLanguage?: boolean;
}
export interface ElevenLabsConversation {
    id: string;
    agentId: string;
    status: "active" | "ended" | "failed";
    duration: number;
    transcript: string;
    recordingUrl?: string;
    createdAt: string;
    endedAt?: string;
}
export interface ElevenLabsAnalytics {
    totalConversations: number;
    activeConversations: number;
    averageDuration: number;
    successRate: number;
    totalMinutes: number;
    cost: number;
}
export interface ElevenLabsUsage {
    totalMinutes: number;
    totalTokens: number;
    totalCalls: number;
    totalCost: number;
}
export declare const useElevenLabsAgents: () => import("@tanstack/react-query").UseQueryResult<ElevenLabsAgent[], Error>;
export declare const useElevenLabsAgent: (agentId: string | null) => import("@tanstack/react-query").UseQueryResult<ElevenLabsAgent, Error>;
export declare const useCreateElevenLabsAgent: () => import("@tanstack/react-query").UseMutationResult<ElevenLabsAgent, Error, {
    name: string;
    voiceId?: string;
    language?: string;
    systemPrompt?: string;
    firstMessage?: string;
    temperature?: number;
    conversationConfig?: {
        maxDuration: number;
        endCallPhrases: string[];
        interruptionThreshold: number;
    };
}, unknown>;
export declare const useUpdateElevenLabsAgent: () => import("@tanstack/react-query").UseMutationResult<ElevenLabsAgent, Error, {
    id: string;
    name?: string;
    voiceId?: string;
    language?: string;
    conversationConfig?: {
        maxDuration?: number;
        endCallPhrases?: string[];
        interruptionThreshold?: number;
    };
}, unknown>;
export declare const useDeleteElevenLabsAgent: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useSyncElevenLabsAgent: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    elevenLabsAgentId: string;
    databaseAgentId: string;
    accountId: string;
}, unknown>;
export declare const useElevenLabsVoices: (language?: string) => import("@tanstack/react-query").UseQueryResult<ElevenLabsVoice[], Error>;
export declare const useElevenLabsModels: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useStartConversation: () => import("@tanstack/react-query").UseMutationResult<ElevenLabsConversation, Error, {
    agentId: string;
    phoneNumber: string;
    accountId: string;
    callId?: string;
}, unknown>;
export declare const useRecentConversations: (limit?: number) => import("@tanstack/react-query").UseQueryResult<ElevenLabsConversation[], Error>;
export declare const useElevenLabsAnalytics: (agentId?: string, dateRange?: {
    from: string;
    to: string;
}) => import("@tanstack/react-query").UseQueryResult<ElevenLabsAnalytics, Error>;
export declare const useElevenLabsUsage: (accountId: string, period?: "month" | "week" | "day") => import("@tanstack/react-query").UseQueryResult<ElevenLabsUsage, Error>;
export declare const useElevenLabsHealth: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useElevenLabsOutboundCall: () => import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    message?: string;
    conversation_id?: string | null;
    callSid?: string | null;
}, any, {
    agentId: string;
    agentPhoneNumberId: string;
    toNumber: string;
    conversationInitiationClientData?: any;
}, unknown>;
export declare const useCreateAgentTest: () => import("@tanstack/react-query").UseMutationResult<unknown, any, {
    chat_history: any[];
    success_condition: string;
    success_examples: any[];
    failure_examples: any[];
    name: string;
    tool_call_parameters?: any;
    dynamic_variables?: any;
    type?: "llm" | "tool";
    from_conversation_metadata?: any;
}, unknown>;
export declare const useRunAgentTests: () => import("@tanstack/react-query").UseMutationResult<unknown, any, {
    agentId: string;
    tests: Array<{
        test_id: string;
    }>;
    agent_config_override?: any;
}, unknown>;
export declare const useGetAgentSignedUrl: () => import("@tanstack/react-query").UseMutationResult<{
    signed_url: string;
}, Error, {
    agentId: string;
    includeConversationId?: boolean;
}, unknown>;
export declare const useGetAgentWebRTCToken: () => import("@tanstack/react-query").UseMutationResult<{
    token: string;
}, Error, {
    agentId: string;
    participantName?: string;
}, unknown>;
export declare const useGetAgentLink: () => import("@tanstack/react-query").UseMutationResult<{
    agent_id: string;
    token: any | null;
}, Error, string, unknown>;
export declare const useGetAgentWidget: () => import("@tanstack/react-query").UseMutationResult<{
    agent_id: string;
    widget_config: any;
}, Error, {
    agentId: string;
    conversationSignature?: string;
}, unknown>;
export declare const useUploadAgentAvatar: () => import("@tanstack/react-query").UseMutationResult<{
    agent_id: string;
    avatar_url: string;
}, Error, {
    agentId: string;
    avatarFile: File;
}, unknown>;
export declare const useSimulateConversation: () => import("@tanstack/react-query").UseMutationResult<{
    simulated_conversation: any[];
    analysis: {
        call_successful: string;
        transcript_summary: string;
        evaluation_criteria_results: any;
        data_collection_results: any;
        call_summary_title: string;
    };
}, Error, {
    agentId: string;
    data: {
        simulation_specification: {
            simulated_user_config: any;
        };
        extra_evaluation_criteria?: any[] | null;
        new_turns_limit?: number;
    };
}, unknown>;
export declare const useCalculateLLMUsage: () => import("@tanstack/react-query").UseMutationResult<{
    llm_prices: Array<{
        llm: string;
        price_per_minute: number;
    }>;
}, Error, {
    agentId: string;
    data: {
        prompt_length?: number | null;
        number_of_pages?: number | null;
        rag_enabled?: boolean | null;
    };
}, unknown>;
