import React from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";

const Breadcrumb: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const path = location.pathname;

    // Mapear rutas a nombres de breadcrumb
    const routeMap: { [key: string]: string } = {
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

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      {breadcrumbItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">&gt;</span>}
            <div className="flex items-center">
              {Icon && <Icon className="w-4 h-4 mr-1" />}
              <span
                className={
                  index === breadcrumbItems.length - 1 ? "text-gray-900" : ""
                }
              >
                {item.name}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
