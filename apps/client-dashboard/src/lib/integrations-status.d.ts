interface IntegrationStatus {
    status: {
        twilio: boolean;
        elevenLabs: boolean;
        goHighLevel: boolean;
    };
    lastChecked: string;
    source: "api" | "verified";
}
export declare function getIntegrationStatus(): Promise<IntegrationStatus>;
export declare const getVerifiedIntegrationsStatus: () => IntegrationStatus;
export declare const VERIFIED_INTEGRATIONS_STATUS: IntegrationStatus;
export {};
