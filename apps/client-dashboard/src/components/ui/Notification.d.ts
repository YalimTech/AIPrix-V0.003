import React from "react";
interface NotificationProps {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: number;
    onClose?: () => void;
}
declare const Notification: React.FC<NotificationProps>;
export declare const NotificationContainer: React.FC;
export default Notification;
