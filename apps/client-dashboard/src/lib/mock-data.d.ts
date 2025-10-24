export declare const mockDashboardStats: {
    totalCalls: number;
    activeAgents: number;
    successfulCalls: number;
    failedCalls: number;
    averageCallDuration: string;
    totalRevenue: number;
    monthlyGrowth: number;
    callSuccessRate: number;
    agentUtilization: number;
};
export declare const mockUserInfo: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    clientId: string;
    accountBalance: number;
    accountStatus: string;
    createdAt: string;
    accountId: string;
    role: string;
    account: {
        id: string;
        name: string;
        plan: string;
        status: string;
        createdAt: string;
    };
    lastLogin: string;
};
export declare const mockRecentActivity: ({
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: {
        duration: string;
        success: boolean;
        agent: string;
        agentName?: undefined;
        voice?: undefined;
        campaignName?: undefined;
        contactCount?: undefined;
        integration?: undefined;
        status?: undefined;
        amount?: undefined;
        currency?: undefined;
        plan?: undefined;
    };
} | {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: {
        agentName: string;
        voice: string;
        duration?: undefined;
        success?: undefined;
        agent?: undefined;
        campaignName?: undefined;
        contactCount?: undefined;
        integration?: undefined;
        status?: undefined;
        amount?: undefined;
        currency?: undefined;
        plan?: undefined;
    };
} | {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: {
        campaignName: string;
        contactCount: number;
        duration?: undefined;
        success?: undefined;
        agent?: undefined;
        agentName?: undefined;
        voice?: undefined;
        integration?: undefined;
        status?: undefined;
        amount?: undefined;
        currency?: undefined;
        plan?: undefined;
    };
} | {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: {
        integration: string;
        status: string;
        duration?: undefined;
        success?: undefined;
        agent?: undefined;
        agentName?: undefined;
        voice?: undefined;
        campaignName?: undefined;
        contactCount?: undefined;
        amount?: undefined;
        currency?: undefined;
        plan?: undefined;
    };
} | {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: {
        amount: number;
        currency: string;
        plan: string;
        duration?: undefined;
        success?: undefined;
        agent?: undefined;
        agentName?: undefined;
        voice?: undefined;
        campaignName?: undefined;
        contactCount?: undefined;
        integration?: undefined;
        status?: undefined;
    };
})[];
export declare const mockIntegrationsStatus: {
    salesforce: {
        connected: boolean;
        name: string;
        lastSync: string;
        status: string;
    };
    hubspot: {
        connected: boolean;
        name: string;
        lastSync: null;
        status: string;
    };
    zapier: {
        connected: boolean;
        name: string;
        lastSync: string;
        status: string;
    };
    webhook: {
        connected: boolean;
        name: string;
        lastSync: string;
        status: string;
    };
};
export declare const mockDashboardIntegrationsStatus: {
    status: {
        twilio: boolean;
        elevenLabs: boolean;
        goHighLevel: boolean;
    };
    lastChecked: string;
};
export declare const mockBillingData: {
    balance: number;
    currency: string;
    paymentMethods: {
        id: string;
        type: string;
        last4: string;
        brand: string;
        expiryMonth: number;
        expiryYear: number;
        isDefault: boolean;
    }[];
    subscription: {
        plan: string;
        status: string;
        currentPeriodStart: string;
        currentPeriodEnd: string;
        amount: number;
        currency: string;
    };
    invoices: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        date: string;
        description: string;
    }[];
};
export declare const simulateNetworkDelay: (ms?: number) => Promise<void>;
