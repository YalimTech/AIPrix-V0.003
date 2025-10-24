export interface BillingData {
    currentBalance: number;
    creditLimit: number;
    lastPayment: {
        amount: number;
        date: string;
        method: string;
    } | null;
    nextPayment: {
        amount: number;
        date: string;
    } | null;
    usage: {
        thisMonth: number;
        lastMonth: number;
        projected: number;
    };
    autoRefill: {
        enabled: boolean;
        threshold: number;
        amount: number;
    };
    elevenLabsUsage: {
        minutesUsed: number;
        tokensUsed: number;
        callsMade: number;
        totalCost: number;
        thisMonth: number;
        lastMonth: number;
    };
    account: {
        id: string;
        name: string;
        email: string;
        subscriptionPlan: string;
        createdAt: string;
    };
}
export interface PaymentMethod {
    id: string;
    type: string;
    lastFour: string;
    brand: string;
    isDefault: boolean;
}
export declare const useBilling: () => {
    billingData: any;
    paymentMethods: {
        id: string;
        type: string;
        last4: string;
        brand: string;
        expiryMonth: number;
        expiryYear: number;
        isDefault: boolean;
    }[] | PaymentMethod[];
    balanceLoading: boolean;
    paymentMethodsLoading: boolean;
    balanceError: Error | null;
    addFunds: import("@tanstack/react-query").UseMutationResult<unknown, any, {
        amount: number;
        paymentMethodId: string;
    }, unknown>;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
    getBalanceStatus: () => "warning" | "low" | "unknown" | "critical" | "good";
    getBalanceColor: () => "text-red-500" | "text-yellow-500" | "text-blue-500" | "text-green-500" | "text-gray-500";
    getMinutesStatus: () => "warning" | "low" | "unknown" | "critical" | "good";
    getMinutesColor: () => "text-gray-400" | "text-red-400" | "text-yellow-400" | "text-blue-400" | "text-green-400";
};
