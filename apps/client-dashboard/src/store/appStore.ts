import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: "light" | "dark";
  loading: boolean;

  // User State
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    account: {
      id: string;
      name: string;
      slug: string;
    };
  } | null;

  // App State
  currentPage: string;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    actions?: Array<{
      label: string;
      action: () => void;
      variant: "primary" | "secondary";
    }>;
  }>;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: AppState["user"]) => void;
  setCurrentPage: (page: string) => void;
  addNotification: (
    notification: Omit<
      AppState["notifications"][0],
      "id" | "timestamp" | "read"
    >,
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial State
      sidebarOpen: false,
      theme: "light",
      loading: false,
      user: null,
      currentPage: "dashboard",
      notifications: [],

      // Actions
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setTheme: (theme: "light" | "dark") => set({ theme }),
      setLoading: (loading: boolean) => set({ loading }),
      setUser: (user: AppState["user"]) => set({ user }),
      setCurrentPage: (page: string) => set({ currentPage: page }),

      addNotification: (notification: Omit<AppState["notifications"][0], "id" | "timestamp" | "read">) => {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = Date.now();
        const newNotification = { ...notification, id, timestamp, read: false };

        set((state: AppState) => {
          const updatedNotifications = [
            ...state.notifications,
            newNotification,
          ];

          // Guardar en localStorage para que el NotificationContainer pueda acceder
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications),
          );

          // Auto-eliminar la notificación después de 5 segundos
          setTimeout(() => {
            set((currentState: AppState) => {
              const filteredNotifications = currentState.notifications.filter(
                (n: AppState["notifications"][0]) => n.id !== id,
              );
              localStorage.setItem(
                "notifications",
                JSON.stringify(filteredNotifications),
              );
              return { notifications: filteredNotifications };
            });
          }, 5000);

          return { notifications: updatedNotifications };
        });
      },

      removeNotification: (id: string) => {
        set((state: AppState) => {
          const updatedNotifications = state.notifications.filter(
            (n: AppState["notifications"][0]) => n.id !== id,
          );
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications),
          );
          return { notifications: updatedNotifications };
        });
      },

      markAsRead: (id: string) => {
        set((state: AppState) => ({
          notifications: state.notifications.map((n: AppState["notifications"][0]) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "app-store",
    },
  ),
);
