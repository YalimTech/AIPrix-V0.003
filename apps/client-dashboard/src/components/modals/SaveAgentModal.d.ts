import React from 'react';
interface SaveAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agent: {
        name: string;
        description: string;
    }) => void;
    initialName?: string;
    initialDescription?: string;
}
declare const SaveAgentModal: React.FC<SaveAgentModalProps>;
export default SaveAgentModal;
