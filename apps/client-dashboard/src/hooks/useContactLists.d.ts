export interface ContactList {
    id: string;
    accountId: string;
    name: string;
    description: string;
    contactCount: number;
    createdAt: string;
    updatedAt: string;
    contacts?: Contact[];
}
export interface Contact {
    id: string;
    accountId: string;
    name: string;
    lastName: string | null;
    phone: string;
    email: string | null;
    company: string | null;
    position: string | null;
    status: string;
    source: string;
    tags: string[];
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare const useContactLists: () => import("@tanstack/react-query").UseQueryResult<ContactList[], any>;
export declare const useContactList: (listId: string) => import("@tanstack/react-query").UseQueryResult<ContactList, Error>;
export declare const useContactsByList: (listId: string | null) => import("@tanstack/react-query").UseQueryResult<Contact[], Error>;
export declare const useCreateContactList: () => import("@tanstack/react-query").UseMutationResult<ContactList, Error, {
    name: string;
    description?: string;
}, unknown>;
export declare const useDeleteContactList: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
