import { create } from 'zustand';

export type ModalType =
  | 'transactions'
  | 'select-crm'
  | 'provider-keys'
  | 'webhook'
  | 'twilio-credentials'
  | 'auto-refill'
  | 'schedule-call-pauses'
  | 'payment-methods'
  | 'add-account-balance';

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  openModal: (modalType: ModalType) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  openModal: (modalType: ModalType) => set({ isOpen: true, modalType }),
  closeModal: () => set({ isOpen: false, modalType: null }),
}));

export const useModal = () => useModalStore((state) => state);
