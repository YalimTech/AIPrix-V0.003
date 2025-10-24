import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
