import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Bars3Icon, BoltIcon, ChartBarIcon, ClockIcon, ExclamationTriangleIcon, EyeIcon, FlagIcon, MicrophoneIcon, PhoneIcon, UserGroupIcon, UserIcon, } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useBilling } from "../../hooks/useBilling";
import { useUserInfo } from "../../hooks/useDashboard";
const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigation = [
        { name: "Overview", href: "/dashboard", icon: EyeIcon },
        { name: "Phone Numbers", href: "/buy-number", icon: PhoneIcon },
        { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
        { name: "Sub Clients", href: "/sub-clients", icon: UserGroupIcon },
    ];
    const agentsNavigation = [
        {
            name: "Saved Agents",
            href: "/saved-agents",
            icon: UserGroupIcon,
        },
        {
            name: "Voice Agent",
            href: "/voice-agent",
            icon: PhoneIcon,
        },
        {
            name: "AI Prompt Generator",
            href: "/ai-prompt-generator",
            icon: BoltIcon,
        },
    ];
    const callManagementNavigation = [
        { name: "Campaigns", href: "/campaigns", icon: FlagIcon },
        { name: "Contacts", href: "/contacts", icon: UserIcon },
        {
            name: "Call Logs & Recordi...",
            href: "/call-logs",
            icon: MicrophoneIcon,
        },
        {
            name: "Error Logs",
            href: "/error-logs",
            icon: ExclamationTriangleIcon,
        },
    ];
    const { user } = useAuth();
    const { billingData } = useBilling();
    const { data: userInfo } = useUserInfo();
    // Calcular balance disponible de ElevenLabs (caracteres)
    const elevenLabsBalance = billingData?.elevenLabsAccount?.subscription
        ? billingData.elevenLabsAccount.subscription.characterLimit -
            billingData.elevenLabsAccount.subscription.characterCount
        : 0;
    const elevenLabsUsed = billingData?.elevenLabsAccount?.subscription?.characterCount || 0;
    const elevenLabsLimit = billingData?.elevenLabsAccount?.subscription?.characterLimit || 0;
    const elevenLabsPercentage = elevenLabsLimit > 0 ? (elevenLabsUsed / elevenLabsLimit) * 100 : 0;
    const isActive = (href) => {
        return (location.pathname === href ||
            (href === "/buy-number" &&
                (location.pathname === "/buy-number" ||
                    location.pathname === "/purchased-numbers")) ||
            (href !== "/dashboard" &&
                href !== "/buy-number" &&
                location.pathname.startsWith(href)));
    };
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden", onClick: onClose })), _jsx("div", { className: `
        sidebar-container fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-72"}
      `, children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: `flex items-center justify-between h-20 border-b border-gray-200 ${isCollapsed ? "px-4" : "px-6"}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center", children: _jsx("div", { className: "w-6 h-6 bg-white rounded-lg flex items-center justify-center", children: _jsx("div", { className: "w-3 h-3 bg-blue-600 rounded-sm" }) }) }), !isCollapsed && (_jsx("span", { className: "text-2xl font-bold text-blue-600", children: "PRIX AI" }))] }), _jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), className: "hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100", children: _jsx(Bars3Icon, { className: "w-6 h-6" }) }), _jsx("button", { onClick: onClose, className: "p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("nav", { className: "flex-1 px-4 py-8 space-y-6 overflow-y-auto", children: [_jsxs("div", { className: "space-y-1", children: [!isCollapsed && (_jsx("h3", { className: "px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: "Dashboard" })), navigation.map((item) => {
                                            const Icon = item.icon;
                                            return (_jsxs(Link, { to: item.href, title: isCollapsed ? item.name : "", className: `
                      flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive(item.href)
                                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
                    `, onClick: onClose, children: [_jsx(Icon, { className: `w-5 h-5 ${!isCollapsed && "mr-4"}` }), !isCollapsed && _jsx("span", { children: item.name })] }, item.name));
                                        })] }), _jsxs("div", { className: "space-y-1", children: [!isCollapsed && (_jsx("h3", { className: "px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: "Agents" })), agentsNavigation.map((item) => {
                                            const Icon = item.icon;
                                            return (_jsxs(Link, { to: item.href, title: isCollapsed ? item.name : "", className: `
                      flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive(item.href)
                                                    ? "bg-purple-50 text-purple-700 shadow-sm"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
                    `, onClick: onClose, children: [_jsx(Icon, { className: `w-5 h-5 ${!isCollapsed && "mr-4"}` }), !isCollapsed && _jsx("span", { children: item.name })] }, item.name));
                                        })] }), _jsxs("div", { className: "space-y-1", children: [!isCollapsed && (_jsx("h3", { className: "px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: "Call Management" })), callManagementNavigation.map((item) => {
                                            const Icon = item.icon;
                                            return (_jsxs(Link, { to: item.href, title: isCollapsed ? item.name : "", className: `
                      flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive(item.href)
                                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
                    `, onClick: onClose, children: [_jsx(Icon, { className: `w-5 h-5 ${!isCollapsed && "mr-4"}` }), !isCollapsed && _jsx("span", { children: item.name })] }, item.name));
                                        })] })] }), _jsx("div", { className: `border-t border-gray-200 bg-gray-50 ${isCollapsed ? "p-3" : "p-6"}`, children: !isCollapsed ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center", children: _jsx(UserIcon, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 truncate", children: user?.firstName && user?.lastName
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : user?.email || "Usuario" }), _jsxs("p", { className: "text-xs text-gray-500 truncate", children: ["Client ID: ", userInfo?.clientId || "N/A"] })] })] }), billingData?.elevenLabsAccount ? (_jsxs("div", { className: "bg-white rounded-lg p-3 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ClockIcon, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-xs font-semibold text-gray-700", children: "ElevenLabs" })] }), _jsx("span", { className: "text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium capitalize", children: billingData.elevenLabsAccount.subscription?.tier ||
                                                            "free" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-[10px] text-gray-500", children: "Caracteres" }), _jsxs("span", { className: "text-[10px] font-semibold text-gray-700", children: [elevenLabsUsed.toLocaleString(), " /", " ", elevenLabsLimit.toLocaleString()] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5 overflow-hidden", children: _jsx("div", { className: "h-full bg-purple-600 transition-all duration-300", style: {
                                                                width: `${Math.min(elevenLabsPercentage, 100)}%`,
                                                            } }) }), _jsx("div", { className: "flex justify-end mt-0.5", children: _jsxs("span", { className: "text-[9px] text-gray-400", children: [elevenLabsPercentage.toFixed(1), "% usado"] }) })] })] })) : (_jsx("div", { className: "bg-white rounded-lg p-3 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(ClockIcon, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-xs text-gray-500", children: "Cargando ElevenLabs..." })] }) }))] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto", children: _jsx(UserIcon, { className: "w-5 h-5 text-white" }) }), billingData?.elevenLabsAccount && (_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto", children: _jsx(ClockIcon, { className: "w-5 h-5 text-purple-600" }) }))] })) })] }) })] }));
};
export default Sidebar;
