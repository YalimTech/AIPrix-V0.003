import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
// import { useAppStore } from "../store/appStore"; // Removed Zustand dependency

// interface WebSocketEvent {
//   type: 'campaign_update' | 'call_update' | 'agent_update' | 'system_notification';
//   data: any;
//   timestamp: string;
// }

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  // Simple notification function without Zustand
  const addNotification = (notification: any) => {
    console.log("WebSocket Notification:", notification);
    // TODO: Implement simple notification system
  };

  useEffect(() => {
    // Solo conectar WebSocket si estamos en modo de desarrollo o si hay una URL válida
    const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL;

    if (!wsUrl || wsUrl.includes("localhost") || wsUrl.includes("127.0.0.1")) {
      setIsConnected(false);
      return;
    }

    // Conectar al WebSocket del backend
    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: false, // Deshabilitar reconexión automática para evitar spam
      auth: {
        // Aquí se puede agregar autenticación si es necesaria
      },
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on("connect", () => {
      console.log("🔌 WebSocket conectado");
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket desconectado:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.warn("⚠️ WebSocket no disponible:", error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Eventos de negocio
    socket.on("campaign_update", (data: any) => {
      console.log("📊 Actualización de campaña:", data);
      addNotification({
        type: "info",
        title: "Campaña actualizada",
        message: `Campaña "${data.campaignName}" - ${data.message}`,
      });
    });

    socket.on("call_update", (data: any) => {
      console.log("📞 Actualización de llamada:", data);
      addNotification({
        type: data.status === "completed" ? "success" : "info",
        title: "Llamada actualizada",
        message: `Llamada a ${data.phoneNumber} - ${data.status}`,
      });
    });

    socket.on("agent_update", (data: any) => {
      console.log("🤖 Actualización de agente:", data);
      addNotification({
        type: "info",
        title: "Agente actualizado",
        message: `Agente "${data.agentName}" - ${data.message}`,
      });
    });

    socket.on("system_notification", (data: any) => {
      console.log("🔔 Notificación del sistema:", data);
      addNotification({
        type: data.level || "info",
        title: data.title || "Notificación del sistema",
        message: data.message,
      });
    });

    // Limpiar conexión al desmontar
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addNotification]);

  // Función para emitir eventos
  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  // Función para suscribirse a eventos específicos
  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Función para desuscribirse de eventos
  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    isConnected,
    connectionError,
    emit,
    subscribe,
    unsubscribe,
    socket: socketRef.current,
  };
};
