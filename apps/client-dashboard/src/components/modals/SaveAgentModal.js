import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
const SaveAgentModal = ({ isOpen, onClose, onSave, initialName = '', initialDescription = '' }) => {
    const [agentName, setAgentName] = useState(initialName);
    const [agentDescription, setAgentDescription] = useState(initialDescription);
    const handleSave = () => {
        if (agentName.trim()) {
            onSave({ name: agentName, description: agentDescription });
            onClose();
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Save Agent" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("div", { children: _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Please enter your agent name:" }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Agent Name" }), _jsx("input", { type: "text", value: agentName, onChange: (e) => setAgentName(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter agent name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Agent Description" }), _jsx("textarea", { value: agentDescription, onChange: (e) => setAgentDescription(e.target.value), rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter agent description (optional)" })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { variant: "danger", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, disabled: !agentName.trim(), children: "Save" })] })] })] })] }) }));
};
export default SaveAgentModal;
