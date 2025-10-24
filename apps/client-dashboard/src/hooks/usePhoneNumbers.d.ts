export interface PhoneNumber {
    id: string;
    number: string;
    country: string;
    region: string;
    capabilities: string[];
    status: "active" | "inactive" | "pending";
    assignedAgentId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface AvailablePhoneNumber {
    number: string;
    country: string;
    region: string;
    locality?: string;
    numberType?: "local" | "tollFree" | "mobile";
    capabilities: string[];
    friendlyName?: string;
    setupPrice?: number;
    monthlyPrice?: number;
    price: number;
    isMagicNumber?: boolean;
    isTestAccount?: boolean;
}
export interface AvailableCountry {
    code: string;
    name: string;
    supported: boolean;
    beta?: boolean;
    subresourceUris?: any;
}
export interface CountryInfo {
    countryCode: string;
    country: string;
    beta: boolean;
    subresourceUris: any;
}
export declare const usePhoneNumbers: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const usePurchasedPhoneNumbers: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useAvailablePhoneNumbers: (filters: {
    country: string;
    numberType: "local" | "tollFree" | "mobile";
    search?: string;
    startsWith?: string;
    endsWith?: string;
    voiceEnabled?: boolean;
    smsEnabled?: boolean;
    mmsEnabled?: boolean;
    faxEnabled?: boolean;
    beta?: boolean;
}) => import("@tanstack/react-query").UseQueryResult<AvailablePhoneNumber[], Error>;
export declare const useBuyPhoneNumber: () => import("@tanstack/react-query").UseMutationResult<PhoneNumber, Error, {
    number: string;
    country: string;
}, unknown>;
export declare const useAssignPhoneNumber: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    phoneNumberId: string;
    agentId: string;
}, unknown>;
export declare const useReleasePhoneNumber: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    phoneNumberId: string;
    confirmationText: string;
}, unknown>;
export declare const useActivatePhoneNumber: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useDeactivatePhoneNumber: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useAvailableCountries: () => import("@tanstack/react-query").UseQueryResult<AvailableCountry[], Error>;
export declare const useCountryInfo: (countryCode: string) => import("@tanstack/react-query").UseQueryResult<CountryInfo, Error>;
export interface PhoneNumberPrice {
    numberType: "local" | "mobile" | "national" | "toll free";
    basePrice: string;
    currentPrice: string;
}
export interface CountryPricing {
    country: string;
    isoCountry: string;
    phoneNumberPrices: PhoneNumberPrice[];
    priceUnit: string;
    url: string;
}
export declare const useCountryPricing: (countryCode: string) => import("@tanstack/react-query").UseQueryResult<CountryPricing, Error>;
export declare const useSyncPhoneNumbersWithElevenLabs: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
