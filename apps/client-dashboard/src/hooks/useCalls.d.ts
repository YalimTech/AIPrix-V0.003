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
export declare const useCalls: (filters?: {
    contactName?: string;
    phoneNumber?: string;
    outcome?: string;
    dateFrom?: string;
    dateTo?: string;
}) => import("@tanstack/react-query").UseQueryResult<Call[], Error>;
export declare const useCallLogs: () => import("@tanstack/react-query").UseQueryResult<Call[], Error>;
export declare const useCreateCall: () => import("@tanstack/react-query").UseMutationResult<Call, Error, Omit<Call, "id" | "createdAt" | "updatedAt">, unknown>;
export declare const useUpdateCall: () => import("@tanstack/react-query").UseMutationResult<Call, Error, Partial<Call> & {
    id: string;
}, unknown>;
export declare const useMakeCall: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    agentId: string;
    phoneNumber: string;
    accountId: string;
}, unknown>;
