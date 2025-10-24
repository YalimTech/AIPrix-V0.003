import React from "react";
interface WebhookConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (url: string) => void;
}
declare const WebhookConfigModal: React.FC<WebhookConfigModalProps>;
export default WebhookConfigModal;
