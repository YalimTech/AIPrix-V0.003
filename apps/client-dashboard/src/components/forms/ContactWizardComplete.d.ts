import React from "react";
interface ContactWizardCompleteProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: any) => void;
}
declare const ContactWizardComplete: React.FC<ContactWizardCompleteProps>;
export default ContactWizardComplete;
