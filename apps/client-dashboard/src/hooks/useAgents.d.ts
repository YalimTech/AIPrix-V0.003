export interface Agent {
    id: string;
    name: string;
    description?: string;
    type: "inbound" | "outbound";
    voiceName: string;
    preMadePrompt?: string;
    maxTokens: number;
    temperature: number;
    status: "active" | "inactive" | "testing";
    createdAt: string;
    updatedAt: string;
    photo?: string;
    agentId?: string;
    elevenLabsAgentId?: string;
    initialMessageDelay?: number;
    doubleCall?: boolean;
    vmDetection?: boolean;
    interruptSensitivity?: boolean;
    responseSpeed?: boolean;
    webhookUrl?: string;
    callTransferType?: "prompt" | "keyword";
    callTransferPhoneNumber?: string;
    callTransferKeywords?: string[];
    callTransferBusinessHours?: boolean;
    calendarBookingEnabled?: boolean;
    calendarBookingProvider?: string;
    calendarBookingId?: string;
    calendarBookingTimezone?: string;
    language?: string;
}
export declare const useAgents: () => import("@tanstack/react-query").UseQueryResult<Agent[], Error>;
export declare const useGetAgent: (id: string) => import("@tanstack/react-query").UseQueryResult<Agent, Error>;
export declare const useCreateAgent: () => import("@tanstack/react-query").UseMutationResult<Agent, Error, Omit<Agent, "id" | "createdAt" | "updatedAt">, unknown>;
export declare const useSyncElevenLabsAgents: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
export declare const useImportElevenLabsAgent: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useUpdateAgent: () => import("@tanstack/react-query").UseMutationResult<Agent, Error, Partial<Agent> & {
    id: string;
}, unknown>;
export declare const useDuplicateAgent: () => import("@tanstack/react-query").UseMutationResult<{
    agent: Agent;
}, Error, {
    id: string;
    newName: string;
}, unknown>;
export declare const useDeleteAgent: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useAgentDiagnostics: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
