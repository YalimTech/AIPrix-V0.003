import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowDownTrayIcon, CreditCardIcon, CurrencyDollarIcon, MagnifyingGlassIcon, PauseIcon, PlusIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import elevenlabsLogo from "../../assets/images/elevenlabs-logo.svg";
import { useAppStore } from "../../store/appStore";
export const TransactionsModal = ({ isOpen, onClose, }) => {
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[85vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Transactions" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(MagnifyingGlassIcon, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search", className: "w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" })] }), _jsx("button", { className: "ml-4 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors", children: _jsx(ArrowDownTrayIcon, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "overflow-x-auto border border-gray-200 rounded-lg", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Client Id" }), _jsx("th", { className: "text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Amount" }), _jsx("th", { className: "text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Type" }), _jsx("th", { className: "text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Description" }), _jsxs("th", { className: "text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider", children: ["Created At ", _jsx("span", { className: "ml-1", children: "\u2193" })] })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-16 text-gray-500 text-sm", children: "0-0 of 0" }) }) })] }) }), _jsxs("div", { className: "flex items-center justify-between mt-6 text-sm text-gray-600", children: [_jsx("span", { className: "font-medium", children: "0-0 of 0" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors", disabled: true, children: _jsx("svg", { className: "w-5 h-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { className: "p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors", disabled: true, children: _jsx("svg", { className: "w-5 h-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] })] })] })] })] }));
};
export const SelectCRMModal = ({ isOpen, onClose, }) => {
    const [selectedCRM, setSelectedCRM] = useState("ghl");
    if (!isOpen)
        return null;
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
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Select Your CRM" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsx("div", { className: "px-8 pb-6", children: _jsx("div", { className: "grid grid-cols-2 gap-4", children: crms.map((crm) => (_jsxs("button", { onClick: () => setSelectedCRM(crm.id), className: `
                  p-5 border-2 rounded-xl text-center transition-all flex flex-col items-center hover:shadow-md
                  ${selectedCRM === crm.id
                                    ? "border-blue-600 bg-blue-50 shadow-sm"
                                    : "border-gray-200 hover:border-blue-300"}
                `, children: [_jsx("div", { className: `w-16 h-16 ${crm.color} rounded-xl flex items-center justify-center mb-3 shadow-md`, children: _jsx("span", { className: "text-white font-bold text-base", children: crm.initials }) }), _jsx("div", { className: "text-sm font-semibold text-gray-900", children: crm.name })] }, crm.id))) }) }), _jsxs("div", { className: "flex items-center justify-end space-x-4 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl", children: [_jsx("button", { onClick: onClose, className: "px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors", children: "Cancel" }), _jsx("button", { className: "px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all", children: "Save" })] })] })] }));
};
export const ProviderKeysModal = ({ isOpen, onClose, }) => {
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
        }
        else {
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
            }
            else if (activeTab === "hubspot") {
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
                    }
                    else if (activeTab === "hubspot") {
                        setApiKey(data.apiKey || "");
                    }
                }
                else {
                    // Si no hay credenciales guardadas, mantener campos vacíos
                    setApiKey("");
                }
            }
        }
        catch (error) {
            console.error(`Error cargando credenciales de ${activeTab}:`, error);
            // En caso de error, mantener campos vacíos
            setApiKey("");
        }
        finally {
            setIsLoadingCredentials(false);
        }
    };
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let endpoint = "";
            if (activeTab === "ghl") {
                endpoint = "/api/v1/integrations/ghl/config";
            }
            else if (activeTab === "hubspot") {
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
                }
                else {
                    addNotification({
                        type: "error",
                        title: "Error",
                        message: "Could not delete credentials",
                    });
                }
                return;
            }
            // Si el campo tiene contenido, actualizar las credenciales
            let body = {};
            if (activeTab === "ghl") {
                body = {
                    apiKey: apiKey.trim(),
                    locationId: "default-location",
                    baseUrl: "https://rest.gohighlevel.com/v1",
                };
            }
            else if (activeTab === "hubspot") {
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
            }
            else {
                const error = await response.json();
                addNotification({
                    type: "error",
                    title: "Error",
                    message: error.message || "Could not update credentials",
                });
            }
        }
        catch (error) {
            console.error(`Error updating ${activeTab} credentials:`, error);
            addNotification({
                type: "error",
                title: "Connection Error",
                message: "Connection error. Please try again.",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Provider Keys" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsxs("div", { className: "flex px-8 gap-4 mb-6", children: [_jsx("button", { onClick: () => setActiveTab("ghl"), className: `
              px-8 py-3 text-base font-bold rounded-lg border-2 transition-all
              ${activeTab === "ghl"
                                    ? "bg-white border-gray-900 text-gray-900 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}
            `, children: "GHL" }), _jsx("button", { onClick: () => setActiveTab("hubspot"), className: `
              px-8 py-3 text-base font-bold rounded-lg border-2 transition-all
              ${activeTab === "hubspot"
                                    ? "bg-white border-blue-600 text-blue-600 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}
            `, children: "HubSp\u00F6t" })] }), _jsx("div", { className: "px-8 pb-6 space-y-4", children: isLoadingCredentials ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-3 text-gray-600", children: "Cargando credenciales..." })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: showApiKey ? "text" : "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: activeTab === "ghl"
                                            ? "Enter your GHL API key"
                                            : "Enter your HubSpot API key", className: "w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-lg text-base placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowApiKey(!showApiKey), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none", "aria-label": showApiKey ? "Ocultar API Key" : "Mostrar API Key", children: showApiKey ? (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) })) : (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) })] }) })) }), _jsxs("div", { className: "flex items-center justify-end space-x-4 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl", children: [_jsx("button", { onClick: onClose, className: "px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: isLoading, className: `
              px-8 py-2.5 rounded-lg font-semibold transition-all
              ${!isLoading
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"}
            `, children: isLoading ? "Updating..." : "Update" })] })] })] }));
};
export const WebhookModal = ({ isOpen, onClose, }) => {
    const [webhookURL, setWebhookURL] = useState("");
    const [isEnabled, setIsEnabled] = useState(false);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Campaign Notifications Webhook" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsxs("div", { className: "px-8 py-6", children: [_jsx("p", { className: "text-sm text-gray-600 leading-relaxed mb-6", children: "This feature lets you receive daily notifications about your campaigns into a webhook of your choice. This can come in handy if you're using automation tools like Zapier or Make.com, or you've set up a workflow in your CRM to receive inbound webhooks. The payload will contain some basic statistics about your campaign, such as the total number of calls made, calls answered, appointments booked, etc." }), _jsx("input", { type: "text", value: webhookURL, onChange: (e) => setWebhookURL(e.target.value), placeholder: "Enter webhook URL here...", className: "w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-5 text-sm placeholder-gray-400 transition-all" }), _jsxs("label", { className: "flex items-start space-x-3 cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: isEnabled, onChange: (e) => setIsEnabled(e.target.checked), className: "mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" }), _jsx("span", { className: "text-sm text-gray-700 group-hover:text-gray-900 transition-colors", children: "Receive campaign notifications through this webhook" })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-4 px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl", children: [_jsx("button", { onClick: onClose, className: "px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors", children: "Close" }), _jsx("button", { disabled: !webhookURL.trim(), className: `
              px-8 py-2.5 rounded-lg font-semibold transition-all
              ${webhookURL.trim()
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"}
            `, children: "Save" })] })] })] }));
};
export const TwilioCredentialsModal = ({ isOpen, onClose, }) => {
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
        }
        else {
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
                }
                else {
                    // Si no hay credenciales guardadas, mantener campos vacíos
                    setAccountSID("");
                    setAuthToken("");
                }
            }
            else {
                // Si no hay credenciales guardadas, mantener campos vacíos
                setAccountSID("");
                setAuthToken("");
            }
        }
        catch (error) {
            console.error("Error cargando credenciales de Twilio:", error);
            // En caso de error, mantener campos vacíos
            setAccountSID("");
            setAuthToken("");
        }
        finally {
            setIsLoadingCredentials(false);
        }
    };
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Si ambos campos están vacíos, eliminar las credenciales
            if (!accountSID.trim() && !authToken.trim()) {
                const response = await fetch("/api/v1/phone-numbers/twilio-credentials", {
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
                        message: "Twilio credentials deleted successfully",
                    });
                    onClose();
                    setAccountSID("");
                    setAuthToken("");
                    setRemoveExistingNumbers(false);
                }
                else {
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
            }
            else {
                const error = await response.json();
                addNotification({
                    type: "error",
                    title: "Error",
                    message: error.message || "Could not update credentials",
                });
            }
        }
        catch (error) {
            console.error("Error updating Twilio credentials:", error);
            addNotification({
                type: "error",
                title: "Connection Error",
                message: "Connection error. Please try again.",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "px-6 py-5", children: _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Update Twilio Credentials" }) }), _jsx("div", { className: "px-6 pb-6 space-y-4", children: isLoadingCredentials ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-3 text-gray-600", children: "Cargando credenciales..." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: showAccountSID ? "text" : "password", value: accountSID, onChange: (e) => setAccountSID(e.target.value), placeholder: "Twilio Account SID", className: "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowAccountSID(!showAccountSID), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none", "aria-label": showAccountSID
                                                ? "Ocultar Account SID"
                                                : "Mostrar Account SID", children: showAccountSID ? (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) })) : (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showAuthToken ? "text" : "password", value: authToken, onChange: (e) => setAuthToken(e.target.value), placeholder: "Twilio Auth Token", className: "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowAuthToken(!showAuthToken), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none", "aria-label": showAuthToken ? "Ocultar Auth Token" : "Mostrar Auth Token", children: showAuthToken ? (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) })) : (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) })] }), _jsxs("label", { className: "flex items-start space-x-3 cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: removeExistingNumbers, onChange: (e) => setRemoveExistingNumbers(e.target.checked), className: "mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" }), _jsx("span", { className: "text-sm text-gray-700 group-hover:text-gray-900 transition-colors", children: "Remove existing active usage numbers." })] })] })) }), _jsx("div", { className: "px-6 py-4", children: _jsx("button", { onClick: handleSubmit, disabled: isLoading, className: `
              w-full py-3 rounded-lg font-semibold transition-all text-sm
              ${!isLoading
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"}
            `, children: isLoading ? "Updating..." : "Update" }) })] })] }));
};
export const AutoRefillModal = ({ isOpen, onClose, }) => {
    const [selectedAmount, setSelectedAmount] = useState("30");
    if (!isOpen)
        return null;
    const amounts = ["30", "50", "100", "200"];
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Set Auto Refill Amount" }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-5 h-5 text-gray-400 hover:text-gray-600" }) })] }), _jsx("div", { className: "px-6 py-6", children: _jsx("div", { className: "grid grid-cols-4 gap-4", children: amounts.map((amount) => (_jsxs("label", { className: "flex items-center justify-center cursor-pointer", children: [_jsx("input", { type: "radio", name: "refillAmount", value: amount, checked: selectedAmount === amount, onChange: (e) => setSelectedAmount(e.target.value), className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" }), _jsxs("span", { className: "ml-2 text-sm font-medium text-gray-700", children: ["$", amount] })] }, amount))) }) }), _jsx("div", { className: "px-6 py-4", children: _jsx("button", { className: "w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all text-sm", children: "Update" }) })] })] }));
};
export const ScheduleCallPausesModal = ({ isOpen, onClose, isEnabled, onToggle }) => {
    const [pauseTimes, setPauseTimes] = useState([
        { id: 1, startTime: "12:00", endTime: "13:00", label: "Lunch Break" },
        { id: 2, startTime: "18:00", endTime: "09:00", label: "Night Hours" },
    ]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(PauseIcon, { className: "w-6 h-6 text-blue-600 mr-3" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Schedule Call Pauses" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("span", { className: "text-lg font-medium text-gray-700", children: "Enable Call Pauses" }), _jsx("button", { onClick: () => onToggle(!isEnabled), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isEnabled ? "bg-blue-600" : "bg-gray-200"}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"}` }) })] }), _jsx("p", { className: "text-sm text-gray-500", children: "Automatically pause calls during specified time periods" })] }), isEnabled && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-700", children: "Pause Schedules" }), pauseTimes.map((pause) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: pause.label }), _jsxs("p", { className: "text-sm text-gray-500", children: [pause.startTime, " - ", pause.endTime] })] }), _jsx("button", { className: "text-red-600 hover:text-red-700 text-sm", children: "Remove" })] }, pause.id))), _jsxs("button", { className: "w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors", children: [_jsx(PlusIcon, { className: "w-5 h-5 mx-auto mb-1" }), "Add New Pause Schedule"] })] }))] }), _jsx("div", { className: "px-6 py-4 border-t border-gray-200", children: _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors", children: "Cancel" }), _jsx("button", { className: "flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all", children: "Save Changes" })] }) })] })] }));
};
export const PaymentMethodsModal = ({ isOpen, onClose, }) => {
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
    const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());
    const handleSubmit = (e) => {
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
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CreditCardIcon, { className: "w-6 h-6 text-blue-600 mr-3" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Payment Methods" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsx("div", { className: "p-8", children: !showAddForm ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-4", children: paymentMethods.map((method) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold mr-3", children: method.type === "Visa" ? "V" : "MC" }), _jsxs("div", { children: [_jsxs("span", { className: "font-medium text-gray-700", children: [method.type, " \u2022\u2022\u2022\u2022 ", method.last4] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Expires ", method.expiryMonth, "/", method.expiryYear] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [method.isDefault && (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: "Default" })), _jsx("button", { className: "text-red-600 hover:text-red-700 text-sm", children: "Remove" })] })] }, method.id))) }), _jsxs("button", { onClick: () => setShowAddForm(true), className: "w-full mt-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors", children: [_jsx(PlusIcon, { className: "w-5 h-5 mx-auto mb-1" }), "Add New Payment Method"] })] })) : (_jsxs("form", { id: "payment-form", onSubmit: handleSubmit, className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Add Payment Methods" }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-semibold text-gray-700 mb-4", children: "Payment Details" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { children: _jsx("input", { type: "text", placeholder: "Name", value: newPaymentMethod.name, onChange: (e) => setNewPaymentMethod({
                                                            ...newPaymentMethod,
                                                            name: e.target.value,
                                                        }), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true }) }), _jsx("div", { children: _jsx("input", { type: "text", placeholder: "Card Number", value: newPaymentMethod.cardNumber, onChange: (e) => setNewPaymentMethod({
                                                            ...newPaymentMethod,
                                                            cardNumber: e.target.value,
                                                        }), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true }) }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx("div", { className: "relative", children: _jsxs("select", { value: newPaymentMethod.expiryMonth, onChange: (e) => setNewPaymentMethod({
                                                                    ...newPaymentMethod,
                                                                    expiryMonth: e.target.value,
                                                                }), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer", required: true, children: [_jsx("option", { value: "", children: "Month" }), months.map((month) => (_jsx("option", { value: month, children: month }, month)))] }) }), _jsx("div", { className: "relative", children: _jsxs("select", { value: newPaymentMethod.expiryYear, onChange: (e) => setNewPaymentMethod({
                                                                    ...newPaymentMethod,
                                                                    expiryYear: e.target.value,
                                                                }), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer", required: true, children: [_jsx("option", { value: "", children: "Year" }), years.map((year) => (_jsx("option", { value: year, children: year }, year)))] }) }), _jsx("div", { children: _jsx("input", { type: "text", placeholder: "CVV", value: newPaymentMethod.cvv, onChange: (e) => setNewPaymentMethod({
                                                                    ...newPaymentMethod,
                                                                    cvv: e.target.value,
                                                                }), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true }) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "differentBillingAddress", checked: newPaymentMethod.differentBillingAddress, onChange: (e) => setNewPaymentMethod({
                                                                ...newPaymentMethod,
                                                                differentBillingAddress: e.target.checked,
                                                            }), className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" }), _jsx("label", { htmlFor: "differentBillingAddress", className: "ml-2 text-sm text-gray-700 cursor-pointer", children: "Different billing address?" })] })] })] })] })) }), _jsx("div", { className: "px-6 py-4 border-t border-gray-200", children: !showAddForm ? (_jsx("button", { onClick: onClose, className: "w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all", children: "Done" })) : (_jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { type: "button", onClick: () => setShowAddForm(false), className: "flex-1 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", form: "payment-form", className: "flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all", children: "Submit" })] })) })] })] }));
};
export const AddAccountBalanceModal = ({ isOpen, onClose, }) => {
    const [amount, setAmount] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("default");
    const quickAmounts = ["25", "50", "100", "250", "500"];
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CurrencyDollarIcon, { className: "w-6 h-6 text-blue-600 mr-3" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Add Account Balance" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6 text-gray-400 hover:text-gray-600" }) })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Amount" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500", children: "$" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "0.00", className: "w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Quick Amounts" }), _jsx("div", { className: "grid grid-cols-5 gap-2", children: quickAmounts.map((quickAmount) => (_jsxs("button", { onClick: () => setAmount(quickAmount), className: `py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${amount === quickAmount
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`, children: ["$", quickAmount] }, quickAmount))) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Payment Method" }), _jsxs("select", { value: selectedPaymentMethod, onChange: (e) => setSelectedPaymentMethod(e.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "default", children: "Visa \u2022\u2022\u2022\u2022 4242" }), _jsx("option", { value: "mastercard", children: "Mastercard \u2022\u2022\u2022\u2022 5555" })] })] }), amount && (_jsx("div", { className: "p-4 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Total to charge:" }), _jsxs("span", { className: "text-lg font-semibold text-gray-900", children: ["$", amount] })] }) }))] }), _jsx("div", { className: "px-6 py-4 border-t border-gray-200", children: _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors", children: "Cancel" }), _jsx("button", { disabled: !amount || parseFloat(amount) <= 0, className: "flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: "Add Balance" })] }) })] })] }));
};
export const ElevenLabsCredentialsModal = ({ isOpen, onClose }) => {
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
        }
        else {
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
                }
                else {
                    setApiKey("");
                }
            }
            else {
                setApiKey("");
            }
        }
        catch (error) {
            console.error("Error cargando credenciales de ElevenLabs:", error);
            setApiKey("");
        }
        finally {
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
                }
                else {
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
            }
            else {
                const errorData = await response.json();
                console.error("Error del servidor:", errorData);
                addNotification({
                    type: "error",
                    title: "Error",
                    message: errorData.message ||
                        "Could not update credentials. Please verify that the API key is valid.",
                });
            }
        }
        catch (error) {
            console.error("Error actualizando credenciales de ElevenLabs:", error);
            addNotification({
                type: "error",
                title: "Connection Error",
                message: "Could not connect to server. Please try again.",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center gap-3 px-6 py-5", children: [_jsx("img", { src: elevenlabsLogo, alt: "ElevenLabs", className: "h-6" }), _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Update ElevenLabs Credentials" })] }), _jsx("div", { className: "px-6 pb-6 space-y-4", children: isLoadingCredentials ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-3 text-gray-600", children: "Cargando credenciales..." })] })) : (_jsxs("div", { className: "relative", children: [_jsx("input", { type: showApiKey ? "text" : "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: "Ingresa tu ElevenLabs API Key", className: "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowApiKey(!showApiKey), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none", "aria-label": showApiKey ? "Ocultar API Key" : "Mostrar API Key", children: showApiKey ? (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) })) : (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) })] })) }), _jsx("div", { className: "px-6 py-4", children: _jsx("button", { onClick: handleSubmit, disabled: isLoading || isLoadingCredentials, className: `
              w-full py-3 rounded-lg font-semibold transition-all text-sm
              ${!isLoading && !isLoadingCredentials
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"}
            `, children: isLoading ? "Updating..." : "Update" }) })] })] }));
};
