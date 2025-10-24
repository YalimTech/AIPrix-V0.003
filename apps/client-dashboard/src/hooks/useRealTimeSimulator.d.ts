/**
 * Hook para simular eventos de tiempo real en desarrollo
 * @param enabled - Si está habilitado (por defecto: false)
 * @returns Objeto con función para simular eventos específicos
 */
export declare const useRealTimeSimulator: (enabled?: boolean) => {
    simulateEvent: (eventType: string, data: any) => void;
};
