import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'developer' | 'support' | 'billing' | 'analyst';
  permissions: Permission[];
  isActive: boolean;
}

interface Permission {
  resource: string;
  actions: string[];
}

interface AdminState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AdminUser, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AdminUser>) => void;
  hasPermission: (resource: string, action: string) => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
      
      hasPermission: (resource: string, action: string) => {
        const { user } = get();
        if (!user) return false;
        
        // Super admin tiene acceso a todo
        if (user.role === 'super_admin') return true;
        
        // Verificar permisos específicos
        const permission = user.permissions.find(p => p.resource === resource);
        return permission?.actions.includes(action) || false;
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
