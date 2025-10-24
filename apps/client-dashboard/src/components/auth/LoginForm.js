import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoginInProgress } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || isLoginInProgress)
            return;
        try {
            await login(email, password);
        }
        catch {
            // Error is handled in the hook
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Iniciar Sesi\u00F3n" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Accede a tu cuenta de PRIX AI" })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "rounded-md shadow-sm -space-y-px", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "sr-only", children: "Email" }), _jsx("input", { id: "email", name: "email", type: "email", autoComplete: "email", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { htmlFor: "password", className: "sr-only", children: "Contrase\u00F1a" }), _jsx("input", { id: "password", name: "password", type: showPassword ? "text" : "password", autoComplete: "current-password", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Contrase\u00F1a", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeSlashIcon, { className: "h-5 w-5 text-gray-400 hover:text-gray-600" })) : (_jsx(EyeIcon, { className: "h-5 w-5 text-gray-400 hover:text-gray-600" })) })] })] }), _jsx("div", { children: _jsx(Button, { type: "submit", variant: "primary", className: "w-full", disabled: isLoginInProgress, children: isLoginInProgress ? "Iniciando sesión..." : "Iniciar Sesión" }) })] })] }) }));
};
export default LoginForm;
