export interface ElevenLabsUserInfo {
    subscription: {
        character_count: number;
        character_limit: number;
        status: string;
        tier: string;
    };
}
export declare const useElevenLabsAccount: () => {
    accountInfo: ElevenLabsUserInfo | null | undefined;
    isLoadingAccount: boolean;
    accountError: Error | null;
    refetchAccountInfo: (options?: import("@tanstack/query-core").RefetchOptions) => Promise<import("@tanstack/query-core").QueryObserverResult<ElevenLabsUserInfo | null, Error>>;
};
