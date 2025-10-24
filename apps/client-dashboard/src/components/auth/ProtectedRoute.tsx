import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoginForm from "./LoginForm";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir al dashboard después del login exitoso
  useEffect(() => {
    if (isAuthenticated && user && location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  // Debug: Log authentication state changes
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      console.log("🔍 ProtectedRoute - Auth State:", {
        isAuthenticated,
        isLoading,
        hasUser: !!user,
        currentPath: location.pathname,
        userEmail: user?.email,
      });
    }
  }, [isAuthenticated, isLoading, user, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
