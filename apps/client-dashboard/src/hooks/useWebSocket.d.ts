import { Socket } from "socket.io-client";
export declare const useWebSocket: () => {
    isConnected: boolean;
    connectionError: string | null;
    emit: (event: string, data: any) => void;
    subscribe: (event: string, callback: (data: any) => void) => void;
    unsubscribe: (event: string, callback?: (data: any) => void) => void;
    socket: Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap> | null;
};
