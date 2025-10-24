import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
const AutoRefillModal = ({ isOpen, onClose, onSave }) => {
    const [selectedAmount, setSelectedAmount] = useState(30);
    const refillOptions = [30, 50, 100, 200];
    const handleSave = () => {
        onSave(selectedAmount);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Update Auto Refill Amount" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Refill Amount" }), _jsx("div", { className: "space-y-3", children: refillOptions.map((amount) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "refillAmount", value: amount, checked: selectedAmount === amount, onChange: (e) => setSelectedAmount(Number(e.target.value)), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" }), _jsxs("span", { className: "ml-3 text-sm font-medium text-gray-900", children: ["$", amount] })] }, amount))) })] }) }), _jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, children: "Submit" })] })] })] })] }) }));
};
export default AutoRefillModal;
