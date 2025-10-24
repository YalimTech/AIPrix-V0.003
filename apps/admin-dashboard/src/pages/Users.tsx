import {
    BuildingOfficeIcon,
    EyeIcon,
    KeyIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    UserPlusIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Datos reales de usuarios - reemplazar con datos de la API
  const users = [
    {
      id: 1,
      name: "Yalim Music",
      email: "test@prixagent.com",
      account: "PrixAgent",
      role: "admin",
      status: "active",
      lastLogin: "2024-10-21",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Yalim Cepeda",
      email: "yalim.cepeda@gmail.com",
      account: "PrixAgent",
      role: "super_admin",
      status: "active",
      lastLogin: "2024-10-21",
      createdAt: "2024-01-10",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.account.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAccount = !accountFilter || user.account === accountFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesAccount && matchesRole && matchesStatus;
  });

  // Obtener lista única de accounts para el filtro
  const uniqueAccounts = [...new Set(users.map((user) => user.account))];

  // Funciones de manejo
  const handleCreateUser = () => {
    console.log("Crear nuevo usuario");
    // Aquí iría la lógica para abrir modal de creación
  };

  const handleEditUser = (userId: number) => {
    console.log("Editar usuario:", userId);
    // Aquí iría la lógica para abrir modal de edición
  };

  const handleDeleteUser = (userId: number) => {
    console.log("Eliminar usuario:", userId);
    // Aquí iría la lógica para confirmar eliminación
  };

  const handleViewUser = (userId: number) => {
    console.log("Ver detalles usuario:", userId);
    // Aquí iría la lógica para ver detalles
  };

  const handleResetPassword = (userId: number) => {
    console.log("Resetear contraseña usuario:", userId);
    // Aquí iría la lógica para resetear contraseña
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      case "super_admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all users across accounts
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Crear Usuario
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Accounts</option>
            {uniqueAccounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {user.account}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Resetear contraseña"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
