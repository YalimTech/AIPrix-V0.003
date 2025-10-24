import React from "react";
interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    callData: any;
}
declare const SummaryModal: React.FC<SummaryModalProps>;
export default SummaryModal;
