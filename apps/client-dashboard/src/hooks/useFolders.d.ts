export interface Folder {
    id: string;
    name: string;
    description?: string;
    color?: string;
    accountId: string;
    createdAt: string;
    updatedAt: string;
    agents?: Agent[];
    _count?: {
        agents: number;
    };
}
export interface Agent {
    id: string;
    name: string;
    description?: string;
    status: string;
    type: string;
    voiceName: string;
    language?: string;
    temperature?: number;
    createdAt: string;
    elevenLabsAgentId?: string;
    folderId?: string;
    folder?: {
        id: string;
        name: string;
        color?: string;
    };
}
export interface CreateFolderDto {
    name: string;
    description?: string;
    color?: string;
}
export interface UpdateFolderDto {
    name?: string;
    description?: string;
    color?: string;
}
export interface MoveAgentsDto {
    agentIds: string[];
    folderId: string | null;
}
export declare const useFolders: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useFolder: (id: string) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useCreateFolder: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateFolderDto, unknown>;
export declare const useUpdateFolder: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: string;
    data: UpdateFolderDto;
}, unknown>;
export declare const useDeleteFolder: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
export declare const useAssignAgentToFolder: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    agentId: string;
    folderId: string | null;
}, unknown>;
export declare const useMoveAgentsToFolder: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, MoveAgentsDto, unknown>;
export declare const useFolderStats: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
export declare const useAssignAgentToFolderViaAgents: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    agentId: string;
    folderId: string | null;
}, unknown>;
export declare const useMoveAgentsToFolderViaAgents: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, MoveAgentsDto, unknown>;
