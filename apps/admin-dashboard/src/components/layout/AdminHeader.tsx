import React, { useState } from 'react';
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-all duration-200"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="ml-3 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Gestión de sistema
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200 group">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100/50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <UserCircleIcon className="w-4 h-4 mr-3" />
                  Perfil
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <Cog6ToothIcon className="w-4 h-4 mr-3" />
                  Configuración
                </button>
                <hr className="my-2 border-gray-200" />
                <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;