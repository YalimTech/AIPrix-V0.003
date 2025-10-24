export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    type: 'document' | 'faq' | 'script' | 'policy';
    category?: string;
    tags: string[];
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export declare const useKnowledge: () => import("@tanstack/react-query").UseQueryResult<KnowledgeEntry[], Error>;
export declare const useKnowledgeSearch: (query: string) => import("@tanstack/react-query").UseQueryResult<KnowledgeEntry[], Error>;
export declare const useCreateKnowledge: () => import("@tanstack/react-query").UseMutationResult<KnowledgeEntry, Error, Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">, unknown>;
export declare const useUpdateKnowledge: () => import("@tanstack/react-query").UseMutationResult<KnowledgeEntry, Error, Partial<KnowledgeEntry> & {
    id: string;
}, unknown>;
export declare const useDeleteKnowledge: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
