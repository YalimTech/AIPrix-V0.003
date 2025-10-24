import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
const TwilioConfigModal = ({ isOpen, onClose, onSave }) => {
    const [accountSid, setAccountSid] = useState('');
    const [authToken, setAuthToken] = useState('');
    const handleSave = () => {
        if (accountSid && authToken) {
            onSave({ accountSid, authToken });
            onClose();
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Twilio Configuration" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Twilio Account SID" }), _jsx("input", { type: "text", value: accountSid, onChange: (e) => setAccountSid(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter your Twilio Account SID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Twilio Auth Token" }), _jsx("input", { type: "password", value: authToken, onChange: (e) => setAuthToken(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter your Twilio Auth Token" })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, disabled: !accountSid || !authToken, children: "Submit" })] })] })] })] }) }));
};
export default TwilioConfigModal;
