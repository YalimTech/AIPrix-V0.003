export interface Campaign {
    id: string;
    name: string;
    description?: string;
    agentId: string;
    contactListId: string;
    budget: number;
    spent: number;
    isActive: boolean;
    contacts: number;
    contactsCalled: number;
    answers: number;
    noAnswers: number;
    transfers: number;
    appointments: number;
    createdAt: string;
    updatedAt: string;
}
export declare const useCampaigns: () => import("@tanstack/react-query").UseQueryResult<Campaign[], Error>;
export declare const useCampaignStats: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useCreateCampaign: () => import("@tanstack/react-query").UseMutationResult<Campaign, Error, Omit<Campaign, "id" | "createdAt" | "updatedAt" | "contacts" | "spent" | "contactsCalled" | "answers" | "noAnswers" | "transfers" | "appointments">, unknown>;
export declare const useUpdateCampaign: () => import("@tanstack/react-query").UseMutationResult<Campaign, Error, Partial<Campaign> & {
    id: string;
}, unknown>;
export declare const useDeleteCampaign: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
