import React from "react";
interface CallTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: CallTransferConfig) => void;
}
interface CallTransferConfig {
    businessHours: boolean;
    type: "prompt" | "keyword";
    phoneNumber: string;
    keywords: string[];
}
declare const CallTransferModal: React.FC<CallTransferModalProps>;
export default CallTransferModal;
