import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Button from '../ui/Button';
const MakeCallModal = ({ isOpen, onClose, onMakeCall }) => {
    const [fromNumber, setFromNumber] = useState('Active usage numbers');
    const [toNumber, setToNumber] = useState('');
    const handleMakeCall = () => {
        if (fromNumber && toNumber) {
            onMakeCall({ fromNumber, toNumber });
            onClose();
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Make A call" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "From Phone Number" }), _jsxs("select", { value: fromNumber, onChange: (e) => setFromNumber(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "Active usage numbers", children: "Active usage numbers" }), _jsx("option", { value: "+1 (650) 684-1386", children: "+1 (650) 684-1386" }), _jsx("option", { value: "+1 (786) 304-1856", children: "+1 (786) 304-1856" }), _jsx("option", { value: "+1 (813) 414-5874", children: "+1 (813) 414-5874" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "To Phone Number" }), _jsxs("div", { className: "flex", children: [_jsxs("select", { className: "px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "+1", children: "\uD83C\uDDFA\uD83C\uDDF8 +1" }), _jsx("option", { value: "+52", children: "\uD83C\uDDF2\uD83C\uDDFD +52" }), _jsx("option", { value: "+34", children: "\uD83C\uDDEA\uD83C\uDDF8 +34" })] }), _jsx("input", { type: "tel", value: toNumber, onChange: (e) => setToNumber(e.target.value), className: "flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter phone number" })] })] })] }), _jsx("div", { className: "flex justify-end mt-6", children: _jsx(Button, { variant: "primary", onClick: handleMakeCall, disabled: !fromNumber || !toNumber, className: "w-full", children: "Launch Call" }) })] })] })] }) }));
};
export default MakeCallModal;
