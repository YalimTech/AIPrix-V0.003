import { create } from "zustand";
import { devtools } from "zustand/middleware";
export const useAppStore = create()(devtools((set) => ({
    // Initial State
    sidebarOpen: false,
    theme: "light",
    loading: false,
    user: null,
    currentPage: "dashboard",
    notifications: [],
    // Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setTheme: (theme) => set({ theme }),
    setLoading: (loading) => set({ loading }),
    setUser: (user) => set({ user }),
    setCurrentPage: (page) => set({ currentPage: page }),
    addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = Date.now();
        const newNotification = { ...notification, id, timestamp, read: false };
        set((state) => {
            const updatedNotifications = [
                ...state.notifications,
                newNotification,
            ];
            // Guardar en localStorage para que el NotificationContainer pueda acceder
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            // Auto-eliminar la notificación después de 5 segundos
            setTimeout(() => {
                set((currentState) => {
                    const filteredNotifications = currentState.notifications.filter((n) => n.id !== id);
                    localStorage.setItem("notifications", JSON.stringify(filteredNotifications));
                    return { notifications: filteredNotifications };
                });
            }, 5000);
            return { notifications: updatedNotifications };
        });
    },
    removeNotification: (id) => {
        set((state) => {
            const updatedNotifications = state.notifications.filter((n) => n.id !== id);
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            return { notifications: updatedNotifications };
        });
    },
    markAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        }));
    },
    clearNotifications: () => set({ notifications: [] }),
}), {
    name: "app-store",
}));
