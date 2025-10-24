export interface ConversationFilters {
    cursor?: string;
    agentId?: string;
    callSuccessful?: "success" | "failure" | "unknown";
    callStartBeforeUnix?: number;
    callStartAfterUnix?: number;
    userId?: string;
    pageSize?: number;
    summaryMode?: "exclude" | "include";
}
export interface Conversation {
    id: string;
    agentId: string;
    agentName: string;
    status: "initiated" | "in-progress" | "processing" | "done" | "failed";
    startTime: number;
    duration: number;
    messageCount: number;
    callSuccessful: "success" | "failure" | "unknown";
    transcriptSummary?: string;
    callSummaryTitle?: string;
    direction: "inbound" | "outbound";
    hasAudio: boolean;
    hasTranscript: boolean;
}
export interface ConversationDetails {
    agent_id: string;
    conversation_id: string;
    status: "initiated" | "in-progress" | "processing" | "done" | "failed";
    transcript: Array<{
        role: "user" | "agent";
        time_in_call_secs: number;
        message: string;
    }>;
    metadata: {
        start_time_unix_secs: number;
        call_duration_secs: number;
        language?: string;
        quality?: string;
    };
    has_audio: boolean;
    has_user_audio: boolean;
    has_response_audio: boolean;
    user_id?: string | null;
    analysis?: {
        sentiment?: string;
        intent?: string;
        confidence?: number;
        keywords?: string[];
    } | null;
    conversation_initiation_client_data?: {
        source?: string;
        campaign?: string;
    } | null;
}
export interface ConversationAnalytics {
    totalConversations: number;
    activeConversations: number;
    averageDuration: number;
    successRate: number;
    totalMinutes: number;
    cost: number;
    agentPerformance: Array<{
        agentId: string;
        agentName: string;
        totalCalls: number;
        successRate: number;
        averageDuration: number;
    }>;
    dailyStats: Array<{
        date: string;
        calls: number;
        successfulCalls: number;
        totalMinutes: number;
    }>;
}
export declare const useConversations: (filters?: ConversationFilters) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useConversationDetails: (conversationId: string, enabled?: boolean) => import("@tanstack/react-query").UseQueryResult<ConversationDetails, Error>;
export declare const useConversationAudio: (conversationId: string, enabled?: boolean) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useConversationAnalytics: () => import("@tanstack/react-query").UseQueryResult<ConversationAnalytics, Error>;
export declare const useConversationFeedback: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    conversationId: string;
    feedback: "like" | "dislike";
}, unknown>;
export declare const useDeleteConversation: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useDownloadConversationAudio: () => import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    message: string;
}, Error, {
    conversationId: string;
    filename?: string;
}, unknown>;
