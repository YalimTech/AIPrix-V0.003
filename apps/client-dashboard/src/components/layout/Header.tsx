import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowsPointingOutIcon,
  Bars3Icon,
  BeakerIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  KeyIcon,
  LinkIcon,
  // Nuevos iconos para las funcionalidades faltantes
  PauseIcon,
  Squares2X2Icon as PlusIcon,
  Squares2X2Icon,
  ArrowPathIcon as SyncIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import ConnectionStatus from "../ui/ConnectionStatus"; // No se usa
// import NotificationCenter from "../ui/NotificationCenter"; // No se usa
import { useAuth } from "../../hooks/useAuth";
import { useUserInfo } from "../../hooks/useDashboard";
import {
  AddAccountBalanceModal,
  AutoRefillModal,
  ElevenLabsCredentialsModal, // Importar nuevo modal
  PaymentMethodsModal,
  ProviderKeysModal,
  ScheduleCallPausesModal,
  SelectCRMModal,
  TransactionsModal,
  TwilioCredentialsModal,
  WebhookModal,
} from "../modals/SettingsModals";
import Breadcrumb from "../ui/Breadcrumb";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuth(); // user no se usa en este componente
  const { data: userInfo } = useUserInfo();
  const navigate = useNavigate();
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isCallPausesEnabled, setIsCallPausesEnabled] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
  };

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
    setIsSettingsMenuOpen(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleNavigateToUsers = () => {
    navigate("/users");
    setIsSettingsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="flex items-center justify-between h-20 px-6">
        {/* Left side - Menu button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Fullscreen button */}
          <button className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200">
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>

          {/* Settings button with dropdown */}
          <div className="relative">
            <button
              onClick={toggleSettingsMenu}
              className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            {/* Settings dropdown menu */}
            {isSettingsMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                {/* User info header */}
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <div className="font-bold text-gray-900 text-base">
                    {userInfo?.firstName && userInfo?.lastName
                      ? `${userInfo.firstName} ${userInfo.lastName}`
                      : userInfo?.email || "Usuario"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Project Admin
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {userInfo?.email || "N/A"}
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  {/* Schedule Call Pauses con toggle switch */}
                  <div className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group">
                    <div className="flex items-center">
                      <PauseIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span>Schedule Call Pauses</span>
                    </div>
                    <button
                      onClick={() =>
                        setIsCallPausesEnabled(!isCallPausesEnabled)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isCallPausesEnabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isCallPausesEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={() => openModal("payment-methods")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <CreditCardIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Payment Methods
                  </button>

                  <button
                    onClick={() => openModal("add-account-balance")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <CurrencyDollarIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Add Account Balance
                  </button>

                  <button
                    onClick={() => openModal("transactions")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <ArrowPathIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Transactions
                  </button>

                  <button
                    onClick={() => openModal("select-crm")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <PlusIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Select CRM
                  </button>

                  <button
                    onClick={() => openModal("provider-keys")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <KeyIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Provider Keys
                  </button>

                  <button
                    onClick={() => openModal("webhook")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <LinkIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Campaign Notifications Webhook
                  </button>

                  <button
                    onClick={() => openModal("twilio-credentials")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <Squares2X2Icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Update Twilio Credentials
                  </button>

                  <button
                    onClick={() => openModal("auto-refill")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <SyncIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Set Auto Refill Amount
                  </button>

                  <button
                    onClick={handleNavigateToUsers}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <UserGroupIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Users
                  </button>

                  {/* (NUEVO) ElevenLabs Credentials */}
                  <button
                    onClick={() => openModal("elevenlabs-credentials")}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <BeakerIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    ElevenLabs Credentials
                  </button>

                  {/* Separator before logout */}
                  <div className="my-2 border-t border-gray-200"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all group"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-600 transition-colors" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-3 border-t border-gray-100">
        <Breadcrumb />
      </div>

      {/* Click outside to close menu */}
      {isSettingsMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSettingsMenuOpen(false)}
        />
      )}

      {/* Modals */}
      <ScheduleCallPausesModal
        isOpen={activeModal === "schedule-call-pauses"}
        onClose={closeModal}
        isEnabled={isCallPausesEnabled}
        onToggle={setIsCallPausesEnabled}
      />
      <PaymentMethodsModal
        isOpen={activeModal === "payment-methods"}
        onClose={closeModal}
      />
      <AddAccountBalanceModal
        isOpen={activeModal === "add-account-balance"}
        onClose={closeModal}
      />
      <TransactionsModal
        isOpen={activeModal === "transactions"}
        onClose={closeModal}
      />
      <SelectCRMModal
        isOpen={activeModal === "select-crm"}
        onClose={closeModal}
      />
      <ProviderKeysModal
        isOpen={activeModal === "provider-keys"}
        onClose={closeModal}
      />
      <WebhookModal isOpen={activeModal === "webhook"} onClose={closeModal} />
      <TwilioCredentialsModal
        isOpen={activeModal === "twilio-credentials"}
        onClose={closeModal}
      />
      <AutoRefillModal
        isOpen={activeModal === "auto-refill"}
        onClose={closeModal}
      />

      {/* (NUEVO) Modal de ElevenLabs */}
      <ElevenLabsCredentialsModal
        isOpen={activeModal === "elevenlabs-credentials"}
        onClose={closeModal}
      />
    </header>
  );
};

export default Header;
