import React from 'react';
interface ContactWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}
declare const ContactWizard: React.FC<ContactWizardProps>;
export default ContactWizard;
