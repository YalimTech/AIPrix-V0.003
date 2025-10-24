import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoginForm from "./LoginForm";
const ProtectedRoute = ({ children }) => {
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
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Cargando..." })] }) }));
    }
    if (!isAuthenticated && !isLoading) {
        return _jsx(LoginForm, {});
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
