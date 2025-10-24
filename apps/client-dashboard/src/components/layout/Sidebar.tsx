import {
  Bars3Icon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FlagIcon,
  MicrophoneIcon,
  PhoneIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useBilling } from "../../hooks/useBilling";
import { useUserInfo } from "../../hooks/useDashboard";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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

  const elevenLabsUsed =
    billingData?.elevenLabsAccount?.subscription?.characterCount || 0;
  const elevenLabsLimit =
    billingData?.elevenLabsAccount?.subscription?.characterLimit || 0;
  const elevenLabsPercentage =
    elevenLabsLimit > 0 ? (elevenLabsUsed / elevenLabsLimit) * 100 : 0;

  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      (href === "/buy-number" &&
        (location.pathname === "/buy-number" ||
          location.pathname === "/purchased-numbers")) ||
      (href !== "/dashboard" &&
        href !== "/buy-number" &&
        location.pathname.startsWith(href))
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        sidebar-container fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-72"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={`flex items-center justify-between h-20 border-b border-gray-200 ${isCollapsed ? "px-4" : "px-6"}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
              {!isCollapsed && (
                <span className="text-2xl font-bold text-blue-600">
                  PRIX AI
                </span>
              )}
            </div>

            {/* Toggle button for desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Dashboard
                </h3>
              )}
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : ""}
                    className={`
                      flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon className={`w-5 h-5 ${!isCollapsed && "mr-4"}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Agents Section */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Agents
                </h3>
              )}
              {agentsNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : ""}
                    className={`
                      flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${
                        isActive(item.href)
                          ? "bg-purple-50 text-purple-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon className={`w-5 h-5 ${!isCollapsed && "mr-4"}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Call Management Section */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Call Management
                </h3>
              )}
              {callManagementNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : ""}
                    className={`
                      flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon className={`w-5 h-5 ${!isCollapsed && "mr-4"}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile & ElevenLabs Balance */}
          <div
            className={`border-t border-gray-200 bg-gray-50 ${isCollapsed ? "p-3" : "p-6"}`}
          >
            {!isCollapsed ? (
              <>
                {/* User Profile */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Client ID: {userInfo?.clientId || "N/A"}
                    </p>
                  </div>
                </div>

                {/* ElevenLabs Balance - Diseño Minimalista */}
                {billingData?.elevenLabsAccount ? (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-gray-700">
                          ElevenLabs
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium capitalize">
                        {billingData.elevenLabsAccount.subscription?.tier ||
                          "free"}
                      </span>
                    </div>

                    {/* Caracteres */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">
                          Caracteres
                        </span>
                        <span className="text-[10px] font-semibold text-gray-700">
                          {elevenLabsUsed.toLocaleString()} /{" "}
                          {elevenLabsLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all duration-300"
                          style={{
                            width: `${Math.min(elevenLabsPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-end mt-0.5">
                        <span className="text-[9px] text-gray-400">
                          {elevenLabsPercentage.toFixed(1)}% usado
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Cargando ElevenLabs...
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                {billingData?.elevenLabsAccount && (
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <ClockIcon className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
