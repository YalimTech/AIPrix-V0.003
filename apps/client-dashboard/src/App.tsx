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
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="dashboard-container">
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/saved-agents" element={<SavedAgents />} />
                <Route path="/voice-agent" element={<VoiceAgent />} />
                <Route path="/inbound-agent" element={<InboundAgent />} />
                <Route path="/outbound-agent" element={<OutboundAgent />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/call-logs" element={<CallLogs />} />
                <Route path="/error-logs" element={<ErrorLogs />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/buy-number" element={<BuyPhoneNumber />} />
                <Route
                  path="/purchased-numbers"
                  element={<PurchasedNumbers />}
                />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/sub-clients" element={<SubClients />} />
                <Route
                  path="/ai-prompt-generator"
                  element={<AIPromptGenerator />}
                />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/users" element={<Users />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/calls" element={<MakeCall />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
          {/* Toaster temporarily disabled for React 19 compatibility */}
          <NotificationContainer />
          <ModalManager />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
