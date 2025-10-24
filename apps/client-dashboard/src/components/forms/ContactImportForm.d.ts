import React from "react";
interface ContactImportFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}
declare const ContactImportForm: React.FC<ContactImportFormProps>;
export default ContactImportForm;
