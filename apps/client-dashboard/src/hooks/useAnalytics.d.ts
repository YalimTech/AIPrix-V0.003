export interface AnalyticsFilters {
    agentId?: string;
    callType?: string;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    phoneNumber?: string;
}
export interface AnalyticsData {
    calls: number;
    minutes: number;
    spent: number;
    didNotConnect: number;
    answers: number;
    noAnswer: number;
    appointments: number;
    transfers: number;
    answerRate: number;
    noAnswerRate: number;
    appointmentRate: number;
    transferRate: number;
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
    lastUpdated: string;
    filters: AnalyticsFilters;
    dataSources: {
        twilio: boolean;
        elevenLabs: boolean;
        goHighLevel: boolean;
        local: boolean;
    };
}
export declare const useAnalytics: (filters?: AnalyticsFilters) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useAgents: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const usePhoneNumbers: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
