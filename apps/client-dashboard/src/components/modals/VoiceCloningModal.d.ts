import React from 'react';
interface VoiceCloningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: any) => void;
}
declare const VoiceCloningModal: React.FC<VoiceCloningModalProps>;
export default VoiceCloningModal;
