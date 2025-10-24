import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
// import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates"; // Temporalmente deshabilitado
import { useRealTimeSimulator } from "../../hooks/useRealTimeSimulator";
import RealTimePanel from "../ui/RealTimePanel";
const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Inicializar actualizaciones en tiempo real
    // useRealTimeUpdates(); // Temporalmente deshabilitado por problemas de React Query
    // Inicializar simulador de eventos (controlado por variable de entorno)
    // Para habilitar: agregar ENABLE_REAL_TIME_SIMULATOR=true en el archivo .env
    const enableSimulator = import.meta.env.VITE_ENABLE_REAL_TIME_SIMULATOR === "true";
    useRealTimeSimulator(enableSimulator);
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsxs("div", { className: "main-content", children: [_jsx(Header, { onMenuClick: () => setSidebarOpen(true) }), _jsx("main", { className: "content-area", children: children })] }), _jsx(RealTimePanel, {})] }));
};
export default Layout;
