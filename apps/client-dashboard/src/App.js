import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
import { useMemo } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
// Layout
import Layout from "./components/layout/Layout";
import { NotificationContainer } from "./components/ui/Notification";
// Pages
import ModalManager from "./components/layout/ModalManager";
import Agents from "./pages/Agents";
import AIPromptGenerator from "./pages/AIPromptGenerator";
import Analytics from "./pages/Analytics";
import BillingPage from "./pages/BillingPage";
import BuyPhoneNumber from "./pages/BuyPhoneNumber";
import CallLogs from "./pages/CallLogs";
import Campaigns from "./pages/Campaigns";
import CardsPage from "./pages/CardsPage";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import ErrorLogs from "./pages/ErrorLogs";
import InboundAgent from "./pages/InboundAgent";
import IntegrationsPage from "./pages/IntegrationsPage";
import MakeCall from "./pages/MakeCall";
import OutboundAgent from "./pages/OutboundAgent";
import PurchasedNumbers from "./pages/PurchasedNumbers";
import Reports from "./pages/Reports";
import SavedAgents from "./pages/SavedAgents";
import SettingsPage from "./pages/SettingsPage";
import SubClients from "./pages/SubClients";
import Users from "./pages/Users";
import VoiceAgent from "./pages/VoiceAgent";
function App() {
    const queryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }), []);
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(Router, { children: _jsxs("div", { className: "dashboard-container", children: [_jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/agents", element: _jsx(Agents, {}) }), _jsx(Route, { path: "/saved-agents", element: _jsx(SavedAgents, {}) }), _jsx(Route, { path: "/voice-agent", element: _jsx(VoiceAgent, {}) }), _jsx(Route, { path: "/inbound-agent", element: _jsx(InboundAgent, {}) }), _jsx(Route, { path: "/outbound-agent", element: _jsx(OutboundAgent, {}) }), _jsx(Route, { path: "/campaigns", element: _jsx(Campaigns, {}) }), _jsx(Route, { path: "/contacts", element: _jsx(Contacts, {}) }), _jsx(Route, { path: "/call-logs", element: _jsx(CallLogs, {}) }), _jsx(Route, { path: "/error-logs", element: _jsx(ErrorLogs, {}) }), _jsx(Route, { path: "/reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "/buy-number", element: _jsx(BuyPhoneNumber, {}) }), _jsx(Route, { path: "/purchased-numbers", element: _jsx(PurchasedNumbers, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "/sub-clients", element: _jsx(SubClients, {}) }), _jsx(Route, { path: "/ai-prompt-generator", element: _jsx(AIPromptGenerator, {}) }), _jsx(Route, { path: "/integrations", element: _jsx(IntegrationsPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/billing", element: _jsx(BillingPage, {}) }), _jsx(Route, { path: "/users", element: _jsx(Users, {}) }), _jsx(Route, { path: "/cards", element: _jsx(CardsPage, {}) }), _jsx(Route, { path: "/calls", element: _jsx(MakeCall, {}) })] }) }) }), _jsx(NotificationContainer, {}), _jsx(ModalManager, {})] }) }), _jsx(ReactQueryDevtools, { initialIsOpen: false })] }));
}
export default App;
