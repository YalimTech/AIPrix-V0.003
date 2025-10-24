import {
  BellIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ShieldCheckIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Detectar si estamos en modo agency basándose en la URL
  const isAgencyMode =
    window.location.pathname.includes("/agency/") ||
    window.location.href.includes(process.env.REACT_APP_AGENCY_PORT || "3003");

  const navigation = isAgencyMode
    ? [
        // Navegación para Agency Dashboard
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon, count: null },
        {
          name: "My Clients",
          href: "/clients",
          icon: BuildingOfficeIcon,
          count: 8,
        },
        { name: "Agents", href: "/agents", icon: UsersIcon, count: 24 },
        {
          name: "Analytics",
          href: "/analytics",
          icon: ChartBarIcon,
          count: null,
        },
        {
          name: "Billing",
          href: "/billing",
          icon: CurrencyDollarIcon,
          count: null,
        },
        { name: "Settings", href: "/settings", icon: CogIcon, count: null },
        { name: "Support", href: "/support", icon: ShieldCheckIcon, count: 2 },
      ]
    : [
        // Navegación para Manager Dashboard (Admin)
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon, count: null },
        {
          name: "Accounts",
          href: "/accounts",
          icon: BuildingOfficeIcon,
          count: 12,
        },
        { name: "Users", href: "/users", icon: UsersIcon, count: 1247 },
        {
          name: "Analytics",
          href: "/analytics",
          icon: ChartBarIcon,
          count: null,
        },
        {
          name: "Billing",
          href: "/billing",
          icon: CurrencyDollarIcon,
          count: null,
        },
        { name: "System", href: "/system", icon: CogIcon, count: null },
        {
          name: "Security",
          href: "/security",
          icon: ShieldCheckIcon,
          count: 3,
        },
        {
          name: "Notifications",
          href: "/notifications",
          icon: BellIcon,
          count: 5,
        },
      ];

  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      (href !== "/dashboard" && location.pathname.startsWith(href))
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  PRIX
                </span>
                <span className="text-lg font-light text-gray-500 ml-1">
                  ADMIN
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative
                    ${
                      active
                        ? "bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 shadow-sm border border-red-200/50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  onClick={onClose}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                        active
                          ? "text-red-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.count && (
                    <span
                      className={`
                      px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-200
                      ${
                        active
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }
                    `}
                    >
                      {item.count > 999
                        ? `${(item.count / 1000).toFixed(1)}k`
                        : item.count}
                    </span>
                  )}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Info */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/50">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Super Administrator
                </p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
