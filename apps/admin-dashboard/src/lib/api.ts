import axios from "axios";
import { useAdminStore } from "../store/admin.store";

// Configuración para desarrollo y producción
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? `${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_PROTOCOL || "http"}://${process.env.REACT_APP_API_HOST || "localhost"}:${process.env.REACT_APP_API_PORT || "3004"}`}/api/v1`
    : process.env.REACT_APP_API_URL || "https://agent.prixcenter.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de administrador
api.interceptors.request.use(
  (config: any) => {
    const token = useAdminStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      useAdminStore.getState().logout();
      window.location.href = "/manager/login";
    }
    return Promise.reject(error);
  },
);

export default api;
