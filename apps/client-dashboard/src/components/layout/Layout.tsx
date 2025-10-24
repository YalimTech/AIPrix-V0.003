import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
// import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates"; // Temporalmente deshabilitado
import { useRealTimeSimulator } from "../../hooks/useRealTimeSimulator";
import RealTimePanel from "../ui/RealTimePanel";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inicializar actualizaciones en tiempo real
  // useRealTimeUpdates(); // Temporalmente deshabilitado por problemas de React Query

  // Inicializar simulador de eventos (controlado por variable de entorno)
  // Para habilitar: agregar ENABLE_REAL_TIME_SIMULATOR=true en el archivo .env
  const enableSimulator =
    import.meta.env.VITE_ENABLE_REAL_TIME_SIMULATOR === "true";
  useRealTimeSimulator(enableSimulator);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="content-area">{children}</main>
      </div>

      {/* Panel de eventos en tiempo real */}
      <RealTimePanel />
    </div>
  );
};

export default Layout;
