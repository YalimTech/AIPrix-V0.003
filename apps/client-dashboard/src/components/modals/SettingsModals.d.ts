import React from "react";
interface TransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const TransactionsModal: React.FC<TransactionsModalProps>;
interface SelectCRMModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const SelectCRMModal: React.FC<SelectCRMModalProps>;
interface ProviderKeysModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const ProviderKeysModal: React.FC<ProviderKeysModalProps>;
interface WebhookModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const WebhookModal: React.FC<WebhookModalProps>;
interface TwilioCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const TwilioCredentialsModal: React.FC<TwilioCredentialsModalProps>;
interface AutoRefillModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const AutoRefillModal: React.FC<AutoRefillModalProps>;
interface ScheduleCallPausesModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
}
export declare const ScheduleCallPausesModal: React.FC<ScheduleCallPausesModalProps>;
interface PaymentMethodsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const PaymentMethodsModal: React.FC<PaymentMethodsModalProps>;
interface AddAccountBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const AddAccountBalanceModal: React.FC<AddAccountBalanceModalProps>;
interface ElevenLabsCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const ElevenLabsCredentialsModal: React.FC<ElevenLabsCredentialsModalProps>;
export {};
