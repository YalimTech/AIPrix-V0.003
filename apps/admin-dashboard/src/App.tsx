import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

// Layout
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import { AdminDashboard } from "./pages/AdminDashboard";
import Accounts from "./pages/Accounts";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Billing from "./pages/Billing";
import System from "./pages/System";
import Security from "./pages/Security";
import Notifications from "./pages/Notifications";
import AdminLogin from "./pages/AdminLogin";

// Create a client with 2025 best practices
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      retry: (failureCount, error: any) => {
        // Retry logic based on error type
        if (error?.status === 404) return false;
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/system" element={<System />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Routes>
                </AdminLayout>
              }
            />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
