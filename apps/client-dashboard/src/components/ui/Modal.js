import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { XMarkIcon } from '@heroicons/react/24/outline';
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: onClose }), _jsxs("div", { className: `
          relative bg-white rounded-lg shadow-xl transform transition-all
          ${sizeClasses[size]} w-full
        `, children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: title }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "p-6", children: children })] })] }) }));
};
export default Modal;
