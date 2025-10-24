import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { WifiIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';
const ConnectionStatus = () => {
    const { isConnected, connectionError } = useWebSocket();
    if (connectionError) {
        return (_jsxs("div", { className: "flex items-center space-x-2 text-red-600", children: [_jsx(ExclamationTriangleIcon, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: "Conexi\u00F3n perdida" })] }));
    }
    if (isConnected) {
        return (_jsxs("div", { className: "flex items-center space-x-2 text-green-600", children: [_jsx(CheckCircleIcon, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: "Conectado" })] }));
    }
    return (_jsxs("div", { className: "flex items-center space-x-2 text-yellow-600", children: [_jsx(WifiIcon, { className: "h-4 w-4 animate-pulse" }), _jsx("span", { className: "text-sm", children: "Conectando..." })] }));
};
export default ConnectionStatus;
