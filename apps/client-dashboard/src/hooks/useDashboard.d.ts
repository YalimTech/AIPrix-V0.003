export interface DashboardStats {
    projectedOutboundMinutes: number;
    projectedInboundMinutes: number;
    activePhoneNumbers: number;
    nextPayment: number;
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    totalCost: number;
    totalMinutes: number;
    averageDuration: number;
    successRate: number;
    activeAgentsCount: number;
    agentsCount: number;
    campaignsCount: number;
    activeCampaignsCount: number;
    contactsCount: number;
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
    };
    lastUpdated: string;
    dataSources: {
        twilio: boolean;
        elevenLabs: boolean;
        goHighLevel: boolean;
        local: boolean;
    };
}
export interface RecentActivity {
    id: string;
    type: "call" | "agent" | "campaign" | "payment" | "conversation" | "contact";
    title: string;
    description: string;
    status: string;
    timestamp: string;
    metadata?: {
        duration?: number;
        cost?: number;
        recordingUrl?: string;
        transcript?: string;
        email?: string;
        phone?: string;
        source?: string;
    };
}
export interface CallLog {
    id: string;
    from: string;
    to: string;
    status: string;
    direction: string;
    duration: number;
    startTime: string;
    endTime?: string;
    price: number;
    recordingUrl?: string;
    transcript?: string;
    contactName?: string;
    agentName?: string;
}
export interface UserInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    clientId: string;
    accountBalance: number;
    accountStatus: string;
    createdAt: string;
}
export interface CallSummary {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    successRate: number;
    totalMinutes: number;
    totalCost: number;
    averageDuration: number;
    topOutcomes: Array<{
        outcome: string;
        count: number;
    }>;
    recommendations: Array<{
        type: "warning" | "info" | "success";
        title: string;
        message: string;
    }>;
    generatedAt: string;
}
export declare const useDashboardStats: () => import("@tanstack/react-query").UseQueryResult<DashboardStats, Error>;
export declare const useRecentActivity: () => import("@tanstack/react-query").UseQueryResult<RecentActivity[], Error>;
export declare const useCallLogs: (filters?: {
    from?: string;
    to?: string;
    outcome?: string;
    direction?: string;
    campaign?: string;
    contactName?: string;
    contactNumber?: string;
    agentName?: string;
    callDuration?: string;
    clientId?: string;
    limit?: number;
    page?: number;
}) => {
    data: {
        calls: CallLog[];
        total: number;
        filters: Record<string, unknown>;
    } | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
};
export declare const useUserInfo: () => import("@tanstack/react-query").UseQueryResult<UserInfo, Error>;
export declare const usePhoneNumbers: () => {
    data: {
        calls: CallLog[];
        total: number;
        filters: Record<string, unknown>;
    } | null;
    isLoading: boolean;
    error: Error | null;
};
export declare const useCallSummary: () => {
    data: CallSummary | null;
    isLoading: boolean;
    error: Error | null;
    generateSummary: (dateRange?: {
        from: string;
        to: string;
    }) => Promise<void>;
};
export declare const useExportCallLogs: () => {
    isLoading: boolean;
    error: Error | null;
    exportLogs: (filters?: any, format?: "csv" | "excel") => Promise<unknown>;
};
export declare const useDeleteCallLog: () => {
    deleteCallLog: (callId: string) => Promise<unknown>;
    isLoading: boolean;
    error: Error | null;
};
export declare const useBulkDeleteCallLogs: () => {
    bulkDeleteCallLogs: (callIds: string[]) => Promise<unknown>;
    isLoading: boolean;
    error: Error | null;
};
export declare const useIntegrationsStatus: () => {
    data: {
        status: {
            twilio: boolean;
            elevenLabs: boolean;
            goHighLevel: boolean;
        };
        lastChecked: string;
        source: "api" | "verified";
    } | null;
    isLoading: boolean;
    error: Error | null;
};
export declare const useUsers: () => {
    data: any[];
    isLoading: boolean;
    error: Error | null;
};
