import React from 'react';
interface TwilioConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: {
        accountSid: string;
        authToken: string;
    }) => void;
}
declare const TwilioConfigModal: React.FC<TwilioConfigModalProps>;
export default TwilioConfigModal;
