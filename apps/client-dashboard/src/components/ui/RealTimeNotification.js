import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../../store/appStore';
const RealTimeNotification = ({ id, type, title, message, timestamp, autoClose = true, duration = 5000, }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const removeNotification = useAppStore((state) => state.removeNotification);
    useEffect(() => {
        // Animar entrada
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration]);
    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            removeNotification(id);
        }, 300);
    };
    const getIcon = () => {
        switch (type) {
            case 'success':
                return _jsx(CheckCircleIcon, { className: "h-5 w-5 text-green-400" });
            case 'error':
                return _jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" });
            case 'warning':
                return _jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-yellow-400" });
            default:
                return _jsx(InformationCircleIcon, { className: "h-5 w-5 text-blue-400" });
        }
    };
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };
    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            default:
                return 'text-blue-800';
        }
    };
    return (_jsx("div", { className: `
        max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${getBackgroundColor()}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `, children: _jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0", children: getIcon() }), _jsxs("div", { className: "ml-3 w-0 flex-1", children: [_jsx("p", { className: `text-sm font-medium ${getTextColor()}`, children: title }), _jsx("p", { className: `mt-1 text-sm ${getTextColor()} opacity-75`, children: message }), _jsx("p", { className: `mt-1 text-xs ${getTextColor()} opacity-50`, children: new Date(timestamp).toLocaleTimeString() })] }), _jsx("div", { className: "ml-4 flex-shrink-0 flex", children: _jsxs("button", { className: `inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`, onClick: handleClose, children: [_jsx("span", { className: "sr-only", children: "Cerrar" }), _jsx(XMarkIcon, { className: "h-4 w-4" })] }) })] }) }) }));
};
export default RealTimeNotification;
