export type ModalType = 'transactions' | 'select-crm' | 'provider-keys' | 'webhook' | 'twilio-credentials' | 'auto-refill' | 'schedule-call-pauses' | 'payment-methods' | 'add-account-balance';
interface ModalState {
    isOpen: boolean;
    modalType: ModalType | null;
    openModal: (modalType: ModalType) => void;
    closeModal: () => void;
}
export declare const useModalStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ModalState>>;
export declare const useModal: () => ModalState;
export {};
