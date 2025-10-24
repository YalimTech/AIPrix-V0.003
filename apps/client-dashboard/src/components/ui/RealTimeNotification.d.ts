import React from 'react';
interface RealTimeNotificationProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    autoClose?: boolean;
    duration?: number;
}
declare const RealTimeNotification: React.FC<RealTimeNotificationProps>;
export default RealTimeNotification;
