export interface CustomVoice {
    id: string;
    name: string;
    accountId: string;
    config: {
        type: string;
        voice_id: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
}
export declare const useCustomVoices: () => import("@tanstack/react-query").UseQueryResult<CustomVoice[], Error>;
export declare const useCreateCustomVoice: () => import("@tanstack/react-query").UseMutationResult<CustomVoice, Error, {
    name: string;
    config: {
        type: string;
        voice_id: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
    };
}, unknown>;
export declare const useUpdateCustomVoice: () => import("@tanstack/react-query").UseMutationResult<CustomVoice, Error, {
    id: string;
    name?: string;
    config?: {
        type?: string;
        voice_id?: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
    };
}, unknown>;
export declare const useDeleteCustomVoice: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useGenerateVoicePreview: () => import("@tanstack/react-query").UseMutationResult<{
    audio_url: string;
    audio_data?: string;
}, Error, {
    voice_id: string;
    text?: string;
    model_id?: string;
    stability?: number;
    similarity_boost?: number;
}, unknown>;
