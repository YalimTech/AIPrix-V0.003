import { useEffect } from "react";
import { useWebSocket } from "./useWebSocket";

/**
 * Hook para simular eventos de tiempo real en desarrollo
 * @param enabled - Si está habilitado (por defecto: false)
 * @returns Objeto con función para simular eventos específicos
 */
export const useRealTimeSimulator = (enabled: boolean = false) => {
  const { emit, isConnected } = useWebSocket();

  useEffect(() => {
    // Solo ejecutar si está habilitado
    if (!enabled) {
      return;
    }

    // Si WebSocket no está disponible, usar simulación local sin WebSocket
    const isWebSocketAvailable = isConnected;

    if (!isWebSocketAvailable) {
      console.log(
        "🎭 Simulador de tiempo real habilitado (solo en desarrollo)",
      );
    }

    // Simular eventos en tiempo real para demostración
    const intervals: NodeJS.Timeout[] = [];

    // Simular actualizaciones de campaña cada 30 segundos
    const campaignInterval = setInterval(() => {
      const campaigns = [
        "Prospeccion Frio Semana 2 Mayo",
        "Campaña de Verano 2024",
        "Follow-up Q3 2024",
        "Nuevos Leads Octubre",
      ];

      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const statuses = ["started", "paused", "completed", "error"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const eventData = {
        campaignId: Math.random().toString(36).substr(2, 9),
        campaignName: campaign,
        status,
        message: `Campaña ${status === "started" ? "iniciada" : status === "paused" ? "pausada" : status === "completed" ? "completada" : "con error"}`,
        timestamp: new Date().toISOString(),
      };

      if (isWebSocketAvailable) {
        emit("campaign_update", eventData);
      } else {
        // Solo mostrar logs ocasionalmente
        if (Math.random() < 0.3) {
          console.log("📊 Simulación - Campaña actualizada:", eventData);
        }
      }
    }, 30000);

    // Simular actualizaciones de llamadas cada 60 segundos
    const callInterval = setInterval(() => {
      const phoneNumbers = [
        "+1234567890",
        "+1987654321",
        "+1555123456",
        "+1444987654",
      ];
      const statuses = ["ringing", "answered", "completed", "failed", "busy"];

      const phoneNumber =
        phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const eventData = {
        callId: Math.random().toString(36).substr(2, 9),
        phoneNumber,
        status,
        duration:
          status === "completed" ? Math.floor(Math.random() * 300) + 30 : 0,
        timestamp: new Date().toISOString(),
      };

      if (isWebSocketAvailable) {
        emit("call_update", eventData);
      } else {
        // Solo mostrar logs cada 5 eventos para reducir verbosidad
        if (Math.random() < 0.2) {
          console.log("📞 Simulación - Llamada actualizada:", eventData);
        }
      }
    }, 60000);

    // Simular actualizaciones de agentes cada 45 segundos
    const agentInterval = setInterval(() => {
      const agents = [
        "Agente de Ventas Principal",
        "Agente de Soporte Técnico",
        "Agente de Follow-up",
        "Agente de Prospección",
      ];

      const agent = agents[Math.floor(Math.random() * agents.length)];
      const actions = ["activated", "deactivated", "updated", "tested"];
      const action = actions[Math.floor(Math.random() * actions.length)];

      const eventData = {
        agentId: Math.random().toString(36).substr(2, 9),
        agentName: agent,
        action,
        message: `Agente ${action === "activated" ? "activado" : action === "deactivated" ? "desactivado" : action === "updated" ? "actualizado" : "probado"}`,
        timestamp: new Date().toISOString(),
      };

      if (isWebSocketAvailable) {
        emit("agent_update", eventData);
      } else {
        // Solo mostrar logs ocasionalmente
        if (Math.random() < 0.25) {
          console.log("🤖 Simulación - Agente actualizado:", eventData);
        }
      }
    }, 45000);

    // Simular notificaciones del sistema cada 60 segundos
    const systemInterval = setInterval(() => {
      const notifications = [
        {
          level: "info",
          title: "Sistema actualizado",
          message: "El sistema se ha actualizado correctamente",
        },
        {
          level: "warning",
          title: "Uso de recursos",
          message: "El uso de CPU está en 85%",
        },
        {
          level: "success",
          title: "Backup completado",
          message: "El backup de la base de datos se completó exitosamente",
        },
        {
          level: "info",
          title: "Nuevo usuario registrado",
          message: "Un nuevo usuario se ha registrado en el sistema",
        },
      ];

      const notification =
        notifications[Math.floor(Math.random() * notifications.length)];

      const eventData = {
        ...notification,
        timestamp: new Date().toISOString(),
      };

      if (isWebSocketAvailable) {
        emit("system_notification", eventData);
      } else {
        // Solo mostrar logs ocasionalmente
        if (Math.random() < 0.2) {
          console.log("🔔 Simulación - Notificación del sistema:", eventData);
        }
      }
    }, 60000);

    intervals.push(
      campaignInterval,
      callInterval,
      agentInterval,
      systemInterval,
    );

    // Limpiar intervalos
    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [enabled, isConnected, emit]);

  return {
    // Función para simular un evento específico
    simulateEvent: (eventType: string, data: any) => {
      emit(eventType, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    },
  };
};
