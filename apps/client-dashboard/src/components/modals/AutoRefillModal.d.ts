import React from 'react';
interface AutoRefillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (amount: number) => void;
}
declare const AutoRefillModal: React.FC<AutoRefillModalProps>;
export default AutoRefillModal;
