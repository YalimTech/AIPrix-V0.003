import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // En modo desarrollo, simular autenticación exitosa
      // Verificar si estamos en desarrollo
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "0.0.0.0";

      if (isDevelopment) {
        // Crear datos de admin simulados para desarrollo
        const mockAdmin = {
          id: "admin-dev-001",
          email: "admin@prixagent.com",
          name: "Administrador Dev",
          role: "super-admin",
        };

        // Guardar datos simulados en localStorage
        localStorage.setItem("admin_token", "dev-token-12345");
        localStorage.setItem("admin_data", JSON.stringify(mockAdmin));

        console.log("🔧 Modo desarrollo: Autenticación simulada activada");
        setIsAuthenticated(true);
        return;
      }

      // En producción, verificar autenticación real
      const token = localStorage.getItem("admin_token");
      const adminData = localStorage.getItem("admin_data");

      if (!token || !adminData) {
        setIsAuthenticated(false);
        navigate("/login");
        return;
      }

      try {
        const admin = JSON.parse(adminData);

        // Verificar que el admin tenga los datos necesarios
        if (!admin || !admin.id || !admin.email) {
          throw new Error("Datos de administrador inválidos");
        }

        // En producción, aquí se haría la validación del token con la API
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing admin data:", error);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Verificando acceso de administrador...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, renderizar el contenido
  return <>{children}</>;
};
