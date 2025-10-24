import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const WebhookConfigModal = ({ isOpen, onClose, onSave, }) => {
    const [webhookUrl, setWebhookUrl] = useState("");
    const handleReset = () => {
        setWebhookUrl("");
    };
    const handleSave = () => {
        if (webhookUrl.trim()) {
            onSave(webhookUrl);
            onClose();
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-md mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "px-6 py-6", children: [_jsx("h2", { className: "text-base font-semibold text-gray-900 mb-2", children: "External Webhook URL" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "Please enter the URL of your catch hook where the call information will be sent." }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Webhook URL ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "url", value: webhookUrl, onChange: (e) => setWebhookUrl(e.target.value), placeholder: "", className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200", children: [_jsx("button", { onClick: handleReset, className: "px-5 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors", children: "Reset" }), _jsx("button", { onClick: handleSave, className: "px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors", children: "Save" })] })] }) }));
};
export default WebhookConfigModal;
