import React from "react";
interface LaunchCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: (fromNumber: string, toNumber: string, agentId?: string, phoneNumberId?: string) => void;
    agentId?: string;
}
declare const LaunchCallModal: React.FC<LaunchCallModalProps>;
export default LaunchCallModal;
