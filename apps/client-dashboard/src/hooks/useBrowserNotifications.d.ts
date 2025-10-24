interface NotificationPermission {
    granted: boolean;
    denied: boolean;
    default: boolean;
}
export declare const useBrowserNotifications: () => {
    permission: NotificationPermission;
    requestPermission: () => Promise<boolean>;
    showNotification: (title: string, options?: NotificationOptions) => Promise<boolean>;
    showCallNotification: (phoneNumber: string, direction: "inbound" | "outbound", agentName?: string) => Promise<boolean>;
    showCampaignNotification: (campaignName: string, status: "started" | "completed" | "paused" | "failed", stats?: {
        calls: number;
        successful: number;
        failed: number;
    }) => Promise<boolean>;
    showSystemNotification: (type: "error" | "warning" | "info" | "success", title: string, message: string, actionUrl?: string) => Promise<boolean>;
    showBillingNotification: (type: "low_balance" | "payment_failed" | "payment_success" | "auto_refill", amount?: number) => Promise<boolean>;
    showIntegrationNotification: (service: string, status: "connected" | "disconnected" | "error", message?: string) => Promise<boolean>;
    clearNotifications: () => void;
};
export {};
