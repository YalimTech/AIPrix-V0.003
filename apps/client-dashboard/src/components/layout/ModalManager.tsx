import React from 'react';
import { useModal } from '../../store/modalStore';
import {
    AddAccountBalanceModal,
    PaymentMethodsModal,
} from '../modals/SettingsModals';

const ModalManager: React.FC = () => {
  const { isOpen, modalType, closeModal } = useModal();

  if (!isOpen || !modalType) {
    return null;
  }

  const renderModal = () => {
    switch (modalType) {
      // case 'transactions':
      //   return <TransactionsModal isOpen={true} onClose={closeModal} />;
      // case 'select-crm':
      //   return <SelectCRMModal isOpen={true} onClose={closeModal} />;
      // case 'provider-keys':
      //   return <ProviderKeysModal isOpen={true} onClose={closeModal} />;
      // case 'webhook':
      //   return <WebhookModal isOpen={true} onClose={closeModal} />;
      // case 'twilio-credentials':
      //   return <TwilioCredentialsModal isOpen={true} onClose={closeModal} />;
      // case 'auto-refill':
      //   return <AutoRefillModal isOpen={true} onClose={closeModal} />;
      // case 'schedule-call-pauses':
      //    return <ScheduleCallPausesModal isOpen={true} onClose={closeModal} isEnabled={false} onToggle={() => {}} />;
      case 'payment-methods':
        return <PaymentMethodsModal isOpen={true} onClose={closeModal} />;
      case 'add-account-balance':
        return <AddAccountBalanceModal isOpen={true} onClose={closeModal} />;
      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};

export default ModalManager;
