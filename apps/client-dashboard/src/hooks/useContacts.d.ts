export interface Contact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    contactListId: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface ContactList {
    id: string;
    name: string;
    description?: string;
    contactCount: number;
    createdAt: string;
    updatedAt: string;
}
export declare const useContacts: (contactListId?: string) => import("@tanstack/react-query").UseQueryResult<Contact[], Error>;
export declare const useContactLists: () => import("@tanstack/react-query").UseQueryResult<ContactList[], Error>;
export declare const useCreateContact: () => import("@tanstack/react-query").UseMutationResult<Contact, Error, Omit<Contact, "id" | "createdAt" | "updatedAt">, unknown>;
export declare const useImportContacts: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    file: File;
    contactListId: string;
    columnMapping: Record<string, string>;
}, unknown>;
export declare const useExportContacts: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string | undefined, unknown>;
