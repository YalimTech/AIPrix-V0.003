import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
const Breadcrumb = () => {
    const location = useLocation();
    const getBreadcrumbItems = () => {
        const path = location.pathname;
        // Mapear rutas a nombres de breadcrumb
        const routeMap = {
            "/dashboard": "Overview",
            "/saved-agents": "Saved Agents",
            "/voice-agent": "Voice Agent",
            "/ai-prompt-generator": "AI Prompt Generator",
            "/campaigns": "Campaigns",
            "/contacts": "Contacts",
            "/call-logs": "Call Logs",
            "/analytics": "Analytics",
            "/sub-clients": "Sub Clients",
            "/buy-number": "Phone Numbers",
            "/purchased-numbers": "Phone Numbers",
        };
        const currentPage = routeMap[path] || "Dashboard";
        return [
            { name: "Home", href: "/dashboard", icon: HomeIcon },
            { name: currentPage, href: path },
        ];
    };
    const breadcrumbItems = getBreadcrumbItems();
    return (_jsx("nav", { className: "flex items-center space-x-2 text-sm text-gray-500", children: breadcrumbItems.map((item, index) => {
            const Icon = item.icon;
            return (_jsxs("div", { className: "flex items-center", children: [index > 0 && _jsx("span", { className: "mx-2", children: ">" }), _jsxs("div", { className: "flex items-center", children: [Icon && _jsx(Icon, { className: "w-4 h-4 mr-1" }), _jsx("span", { className: index === breadcrumbItems.length - 1 ? "text-gray-900" : "", children: item.name })] })] }, index));
        }) }));
};
export default Breadcrumb;
