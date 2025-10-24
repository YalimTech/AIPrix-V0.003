interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    account: {
        id: string;
        name: string;
        slug: string;
    };
}
export declare const useAuth: () => {
    user: User | null;
    isLoading: boolean;
    isLoginInProgress: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
};
export {};
