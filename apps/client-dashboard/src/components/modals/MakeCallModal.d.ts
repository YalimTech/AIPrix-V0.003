import React from 'react';
interface MakeCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMakeCall: (callData: {
        fromNumber: string;
        toNumber: string;
    }) => void;
}
declare const MakeCallModal: React.FC<MakeCallModalProps>;
export default MakeCallModal;
