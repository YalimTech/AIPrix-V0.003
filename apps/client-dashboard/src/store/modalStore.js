import { create } from 'zustand';
export const useModalStore = create((set) => ({
    isOpen: false,
    modalType: null,
    openModal: (modalType) => set({ isOpen: true, modalType }),
    closeModal: () => set({ isOpen: false, modalType: null }),
}));
export const useModal = () => useModalStore((state) => state);
