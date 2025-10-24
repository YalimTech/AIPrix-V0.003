import {
  ArrowDownTrayIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import elevenlabsLogo from "../../assets/images/elevenlabs-logo.svg";
import { useAppStore } from "../../store/appStore";

// Transactions Modal
interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Search and Download */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <button className="ml-4 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Client Id
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created At <span className="ml-1">↓</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-gray-500 text-sm"
                  >
                    0-0 of 0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
            <span className="font-medium">0-0 of 0</span>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Select CRM Modal
interface SelectCRMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelectCRMModal: React.FC<SelectCRMModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCRM, setSelectedCRM] = useState("ghl");

  if (!isOpen) return null;

  const crms = [
    { id: "ghl", name: "GHL", color: "bg-blue-600", initials: "GHL" },
    { id: "hubspot", name: "HubSpöt", color: "bg-orange-500", initials: "HS" },
    { id: "zoho", name: "Zoho", color: "bg-red-500", initials: "Z" },
    { id: "monday", name: "monday.com", color: "bg-pink-500", initials: "M" },
    {
      id: "salesforce",
      name: "Salesforce",
      color: "bg-blue-400",
      initials: "SF",
    },
    { id: "fub", name: "fub", color: "bg-red-600", initials: "F" },
    {
      id: "pipedrive",
      name: "pipedrive",
      color: "bg-green-500",
      initials: "PD",
    },
    { id: "close", name: "Close", color: "bg-purple-600", initials: "C" },
    {
      id: "jobnimbus",
      name: "JobNimbus",
      color: "bg-blue-700",
      initials: "JN",
    },
    { id: "other", name: "Other", color: "bg-gray-600", initials: "🌐" },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Select Your CRM</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {crms.map((crm) => (
              <button
                key={crm.id}
                onClick={() => setSelectedCRM(crm.id)}
                className={`
                  p-5 border-2 rounded-xl text-center transition-all flex flex-col items-center hover:shadow-md
                  ${
                    selectedCRM === crm.id
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                <div
                  className={`w-16 h-16 ${crm.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}
                >
                  <span className="text-white font-bold text-base">
                    {crm.initials}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {crm.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Provider Keys Modal
interface ProviderKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderKeysModal: React.FC<ProviderKeysModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("ghl");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const addNotification = useAppStore((state) => state.addNotification);

  // Cargar credenciales existentes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadExistingCredentials();
      setShowApiKey(false); // Resetear el estado de mostrar/ocultar
    } else {
      // Limpiar los estados cuando el modal se cierra
      setApiKey("");
      setShowApiKey(false);
    }
  }, [isOpen, activeTab]);

  const loadExistingCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      let endpoint = "";

      if (activeTab === "ghl") {
        endpoint = "/api/v1/integrations/ghl/config";
      } else if (activeTab === "hubspot") {
        endpoint = "/api/v1/integrations/hubspot/config";
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (activeTab === "ghl") {
            setApiKey(data.apiKey || "");
          } else if (activeTab === "hubspot") {
            setApiKey(data.apiKey || "");
          }
        } else {
          // Si no hay credenciales guardadas, mantener campos vacíos
          setApiKey("");
        }
      }
    } catch (error) {
      console.error(`Error cargando credenciales de ${activeTab}:`, error);
      // En caso de error, mantener campos vacíos
      setApiKey("");
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let endpoint = "";

      if (activeTab === "ghl") {
        endpoint = "/api/v1/integrations/ghl/config";
      } else if (activeTab === "hubspot") {
        endpoint = "/api/v1/integrations/hubspot/config";
      }

      // Si el campo está vacío, eliminar las credenciales
      if (!apiKey.trim()) {
        const response = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.ok || response.status === 204) {
          addNotification({
            type: "success",
            title: "Success",
            message: `${activeTab.toUpperCase()} credentials deleted successfully`,
          });
          onClose();
          setApiKey("");
        } else {
          addNotification({
            type: "error",
            title: "Error",
            message: "Could not delete credentials",
          });
        }
        return;
      }

      // Si el campo tiene contenido, actualizar las credenciales
      let body: any = {};

      if (activeTab === "ghl") {
        body = {
          apiKey: apiKey.trim(),
          locationId: "default-location",
          baseUrl: "https://rest.gohighlevel.com/v1",
        };
      } else if (activeTab === "hubspot") {
        body = {
          apiKey: apiKey.trim(),
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        addNotification({
          type: "success",
          title: "Success",
          message: `${activeTab.toUpperCase()} credentials updated successfully`,
        });
        onClose();
      } else {
        const error = await response.json();
        addNotification({
          type: "error",
          title: "Error",
          message: error.message || "Could not update credentials",
        });
      }
    } catch (error) {
      console.error(`Error updating ${activeTab} credentials:`, error);
      addNotification({
        type: "error",
        title: "Connection Error",
        message: "Connection error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Provider Keys</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 gap-4 mb-6">
          <button
            onClick={() => setActiveTab("ghl")}
            className={`
              px-8 py-3 text-base font-bold rounded-lg border-2 transition-all
              ${
                activeTab === "ghl"
                  ? "bg-white border-gray-900 text-gray-900 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }
            `}
          >
            GHL
          </button>
          <button
            onClick={() => setActiveTab("hubspot")}
            className={`
              px-8 py-3 text-base font-bold rounded-lg border-2 transition-all
              ${
                activeTab === "hubspot"
                  ? "bg-white border-blue-600 text-blue-600 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }
            `}
          >
            HubSpöt
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 space-y-4">
          {isLoadingCredentials ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Cargando credenciales...
              </span>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    activeTab === "ghl"
                      ? "Enter your GHL API key"
                      : "Enter your HubSpot API key"
                  }
                  className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-lg text-base placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showApiKey ? "Ocultar API Key" : "Mostrar API Key"
                  }
                >
                  {showApiKey ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              px-8 py-2.5 rounded-lg font-semibold transition-all
              ${
                !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Campaign Notifications Webhook Modal
interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [webhookURL, setWebhookURL] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Campaign Notifications Webhook
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            This feature lets you receive daily notifications about your
            campaigns into a webhook of your choice. This can come in handy if
            you're using automation tools like Zapier or Make.com, or you've set
            up a workflow in your CRM to receive inbound webhooks. The payload
            will contain some basic statistics about your campaign, such as the
            total number of calls made, calls answered, appointments booked,
            etc.
          </p>

          <input
            type="text"
            value={webhookURL}
            onChange={(e) => setWebhookURL(e.target.value)}
            placeholder="Enter webhook URL here..."
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-5 text-sm placeholder-gray-400 transition-all"
          />

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Receive campaign notifications through this webhook
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            Close
          </button>
          <button
            disabled={!webhookURL.trim()}
            className={`
              px-8 py-2.5 rounded-lg font-semibold transition-all
              ${
                webhookURL.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Update Twilio Credentials Modal
interface TwilioCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwilioCredentialsModal: React.FC<TwilioCredentialsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [accountSID, setAccountSID] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [removeExistingNumbers, setRemoveExistingNumbers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showAccountSID, setShowAccountSID] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const addNotification = useAppStore((state) => state.addNotification);

  // Cargar credenciales existentes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadExistingCredentials();
      setShowAccountSID(false); // Resetear el estado de mostrar/ocultar
      setShowAuthToken(false); // Resetear el estado de mostrar/ocultar
    } else {
      // Limpiar los estados cuando el modal se cierra
      setAccountSID("");
      setAuthToken("");
      setShowAccountSID(false);
      setShowAuthToken(false);
      setRemoveExistingNumbers(false);
    }
  }, [isOpen]);

  const loadExistingCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      const response = await fetch("/api/v1/phone-numbers/twilio-credentials", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasCredentials) {
          setAccountSID(data.accountSid || "");
          setAuthToken(data.authToken || "");
        } else {
          // Si no hay credenciales guardadas, mantener campos vacíos
          setAccountSID("");
          setAuthToken("");
        }
      } else {
        // Si no hay credenciales guardadas, mantener campos vacíos
        setAccountSID("");
        setAuthToken("");
      }
    } catch (error) {
      console.error("Error cargando credenciales de Twilio:", error);
      // En caso de error, mantener campos vacíos
      setAccountSID("");
      setAuthToken("");
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Si ambos campos están vacíos, eliminar las credenciales
      if (!accountSID.trim() && !authToken.trim()) {
        const response = await fetch(
          "/api/v1/phone-numbers/twilio-credentials",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        );

        if (response.ok || response.status === 204) {
          addNotification({
            type: "success",
            title: "Success",
            message: "Twilio credentials deleted successfully",
          });
          onClose();
          setAccountSID("");
          setAuthToken("");
          setRemoveExistingNumbers(false);
        } else {
          addNotification({
            type: "error",
            title: "Error",
            message: "Could not delete credentials",
          });
        }
        return;
      }

      // Si al menos uno de los campos tiene contenido, actualizar las credenciales
      if (!accountSID.trim() || !authToken.trim()) {
        addNotification({
          type: "error",
          title: "Validation Error",
          message: "Please fill in both Account SID and Auth Token",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/v1/phone-numbers/twilio-credentials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          accountSid: accountSID.trim(),
          authToken: authToken.trim(),
          webhookUrl: `${window.location.origin}/api/v1/webhooks/twilio`,
        }),
      });

      if (response.ok) {
        addNotification({
          type: "success",
          title: "Success",
          message: "Twilio credentials updated successfully",
        });
        onClose();
        setRemoveExistingNumbers(false);
      } else {
        const error = await response.json();
        addNotification({
          type: "error",
          title: "Error",
          message: error.message || "Could not update credentials",
        });
      }
    } catch (error) {
      console.error("Error updating Twilio credentials:", error);
      addNotification({
        type: "error",
        title: "Connection Error",
        message: "Connection error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">
            Update Twilio Credentials
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {isLoadingCredentials ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Cargando credenciales...
              </span>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type={showAccountSID ? "text" : "password"}
                  value={accountSID}
                  onChange={(e) => setAccountSID(e.target.value)}
                  placeholder="Twilio Account SID"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAccountSID(!showAccountSID)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showAccountSID
                      ? "Ocultar Account SID"
                      : "Mostrar Account SID"
                  }
                >
                  {showAccountSID ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showAuthToken ? "text" : "password"}
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Twilio Auth Token"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showAuthToken ? "Ocultar Auth Token" : "Mostrar Auth Token"
                  }
                >
                  {showAuthToken ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={removeExistingNumbers}
                  onChange={(e) => setRemoveExistingNumbers(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remove existing active usage numbers.
                </span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              w-full py-3 rounded-lg font-semibold transition-all text-sm
              ${
                !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Set Auto Refill Amount Modal
interface AutoRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoRefillModal: React.FC<AutoRefillModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedAmount, setSelectedAmount] = useState("30");

  if (!isOpen) return null;

  const amounts = ["30", "50", "100", "200"];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Set Auto Refill Amount
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-4 gap-4">
            {amounts.map((amount) => (
              <label
                key={amount}
                className="flex items-center justify-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="refillAmount"
                  value={amount}
                  checked={selectedAmount === amount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  ${amount}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all text-sm">
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// Schedule Call Pauses Modal
interface ScheduleCallPausesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ScheduleCallPausesModal: React.FC<
  ScheduleCallPausesModalProps
> = ({ isOpen, onClose, isEnabled, onToggle }) => {
  const [pauseTimes, setPauseTimes] = useState([
    { id: 1, startTime: "12:00", endTime: "13:00", label: "Lunch Break" },
    { id: 2, startTime: "18:00", endTime: "09:00", label: "Night Hours" },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <PauseIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Schedule Call Pauses
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-700">
                Enable Call Pauses
              </span>
              <button
                onClick={() => onToggle(!isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Automatically pause calls during specified time periods
            </p>
          </div>

          {isEnabled && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                Pause Schedules
              </h3>
              {pauseTimes.map((pause) => (
                <div
                  key={pause.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-700">
                      {pause.label}
                    </span>
                    <p className="text-sm text-gray-500">
                      {pause.startTime} - {pause.endTime}
                    </p>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm">
                    Remove
                  </button>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                <PlusIcon className="w-5 h-5 mx-auto mb-1" />
                Add New Pause Schedule
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Methods Modal
interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "25",
      isDefault: true,
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "5555",
      expiryMonth: "06",
      expiryYear: "26",
      isDefault: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    differentBillingAddress: false,
  });

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const years = Array.from({ length: 10 }, (_, i) =>
    (new Date().getFullYear() + i).toString(),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para agregar el nuevo método de pago
    console.log("Nuevo método de pago:", newPaymentMethod);
    setShowAddForm(false);
    setNewPaymentMethod({
      name: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      differentBillingAddress: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <CreditCardIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Methods
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {!showAddForm ? (
            <>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold mr-3">
                        {method.type === "Visa" ? "V" : "MC"}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          {method.type} •••• {method.last4}
                        </span>
                        <p className="text-sm text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                      <button className="text-red-600 hover:text-red-700 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mx-auto mb-1" />
                Add New Payment Method
              </button>
            </>
          ) : (
            <form
              id="payment-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Payment Methods
              </h3>

              {/* Payment Details Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Payment Details
                </h4>

                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={newPaymentMethod.name}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Card Number Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={newPaymentMethod.cardNumber}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          cardNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Expiration Date & CVV Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Month Dropdown */}
                    <div className="relative">
                      <select
                        value={newPaymentMethod.expiryMonth}
                        onChange={(e) =>
                          setNewPaymentMethod({
                            ...newPaymentMethod,
                            expiryMonth: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Month</option>
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative">
                      <select
                        value={newPaymentMethod.expiryYear}
                        onChange={(e) =>
                          setNewPaymentMethod({
                            ...newPaymentMethod,
                            expiryYear: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CVV Field */}
                    <div>
                      <input
                        type="text"
                        placeholder="CVV"
                        value={newPaymentMethod.cvv}
                        onChange={(e) =>
                          setNewPaymentMethod({
                            ...newPaymentMethod,
                            cvv: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Different Billing Address Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="differentBillingAddress"
                      checked={newPaymentMethod.differentBillingAddress}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          differentBillingAddress: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="differentBillingAddress"
                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                    >
                      Different billing address?
                    </label>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          {!showAddForm ? (
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Done
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="payment-form"
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Account Balance Modal
interface AddAccountBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountBalanceModal: React.FC<AddAccountBalanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("default");

  const quickAmounts = ["25", "50", "100", "250", "500"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Add Account Balance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Amounts
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                    amount === quickAmount
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="default">Visa •••• 4242</option>
              <option value="mastercard">Mastercard •••• 5555</option>
            </select>
          </div>

          {amount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total to charge:</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${amount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ElevenLabs Credentials Modal (NUEVO)
interface ElevenLabsCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ElevenLabsCredentialsModal: React.FC<
  ElevenLabsCredentialsModalProps
> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const addNotification = useAppStore((state) => state.addNotification);

  // Cargar credenciales existentes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadExistingCredentials();
      setShowApiKey(false); // Resetear el estado de mostrar/ocultar
    } else {
      // Limpiar los estados cuando el modal se cierra
      setApiKey("");
      setShowApiKey(false);
    }
  }, [isOpen]);

  const loadExistingCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      const response = await fetch("/api/v1/integrations/elevenlabs/config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setApiKey("");
        }
      } else {
        setApiKey("");
      }
    } catch (error) {
      console.error("Error cargando credenciales de ElevenLabs:", error);
      setApiKey("");
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Si el campo está vacío, eliminar las credenciales
      if (!apiKey || apiKey.trim() === "") {
        const response = await fetch("/api/v1/integrations/elevenlabs/config", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.ok || response.status === 204) {
          addNotification({
            type: "success",
            title: "Success",
            message: "ElevenLabs credentials deleted successfully.",
          });
          onClose();
        } else {
          addNotification({
            type: "error",
            title: "Error",
            message: "Could not delete credentials.",
          });
        }
        return;
      }

      // Si el campo tiene contenido, actualizar las credenciales
      const response = await fetch("/api/v1/integrations/elevenlabs/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
        }),
      });

      if (response.ok) {
        addNotification({
          type: "success",
          title: "Success",
          message: "ElevenLabs credentials updated successfully.",
        });
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        addNotification({
          type: "error",
          title: "Error",
          message:
            errorData.message ||
            "Could not update credentials. Please verify that the API key is valid.",
        });
      }
    } catch (error) {
      console.error("Error actualizando credenciales de ElevenLabs:", error);
      addNotification({
        type: "error",
        title: "Connection Error",
        message: "Could not connect to server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-5">
          <img src={elevenlabsLogo} alt="ElevenLabs" className="h-6" />
          <h2 className="text-xl font-bold text-gray-900">
            Update ElevenLabs Credentials
          </h2>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {isLoadingCredentials ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Cargando credenciales...
              </span>
            </div>
          ) : (
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu ElevenLabs API Key"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showApiKey ? "Ocultar API Key" : "Mostrar API Key"}
              >
                {showApiKey ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || isLoadingCredentials}
            className={`
              w-full py-3 rounded-lg font-semibold transition-all text-sm
              ${
                !isLoading && !isLoadingCredentials
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};
