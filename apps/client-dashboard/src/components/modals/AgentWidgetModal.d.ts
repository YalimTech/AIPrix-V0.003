import React from "react";
interface AgentWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    onAvatarUploaded?: (avatarUrl: string) => void;
}
declare const AgentWidgetModal: React.FC<AgentWidgetModalProps>;
export default AgentWidgetModal;
