import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useUsers } from "../hooks/useDashboard";

interface User {
  id: string;
  email: string;
  name: string;
  permissions: string;
  status: "active" | "inactive";
}

const Users: React.FC = () => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    role: false,
    status: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    password: "",
    confirmPassword: "",
  });

  // Obtener usuarios reales desde la API
  const { data: users, isLoading, error } = useUsers();

  // Obtener información del usuario actual para verificar permisos
  const userData = localStorage.getItem("user_data");
  const currentUser = userData ? JSON.parse(userData) : null;
  const currentUserRole = currentUser?.role || "user";
  const isAdmin =
    currentUserRole === "admin" || currentUserRole === "super_admin";

  // Debug: verificar el rol del usuario
  console.log("🔍 Debug Users.tsx:", {
    userData,
    currentUser,
    currentUserRole,
    isAdmin,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark field as touched
    if (field === "role" || field === "status") {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.role &&
      formData.status &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async () => {
    // Mark all fields as touched to show validation
    setTouched({ role: true, status: true });

    if (isFormValid()) {
      try {
        // Crear el usuario usando la API
        const userData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          password: formData.password,
        };

        const response = await fetch("/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          // Usuario creado exitosamente
          console.log("✅ Usuario creado exitosamente");
          setIsAddUserModalOpen(false);
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            role: "",
            status: "",
            password: "",
            confirmPassword: "",
          });
          setTouched({ role: false, status: false });
          // Usar invalidateQueries en lugar de recarga completa
          // window.location.reload();
        } else {
          const errorData = await response.json();
          console.error("❌ Error creando usuario:", errorData);
          alert(
            `Error creando usuario: ${errorData.message || "Error desconocido"}`,
          );
        }
      } catch (error) {
        console.error("❌ Error creando usuario:", error);
        alert("Error creando usuario. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "",
      password: "",
      confirmPassword: "",
    });
    setTouched({ role: false, status: false });
  };

  const handleEditUser = (user: User) => {
    // TODO: Implementar modal de edición
    console.log("Edit user:", user);
    alert(`Editar usuario: ${user.email}`);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setDeleteConfirmation("");
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || deleteConfirmation !== "DELETE") {
      return;
    }

    try {
      const response = await fetch(`/api/v1/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        console.log("✅ Usuario eliminado exitosamente");
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setDeleteConfirmation("");
        // Usar invalidateQueries en lugar de recarga completa
        // window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("❌ Error eliminando usuario:", errorData);
        alert(
          `Error eliminando usuario: ${errorData.message || "Error desconocido"}`,
        );
      }
    } catch (error) {
      console.error("❌ Error eliminando usuario:", error);
      alert("Error eliminando usuario. Por favor, inténtalo de nuevo.");
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteConfirmation("");
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <p className="text-red-600">
              Error al cargar usuarios: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {isAdmin && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.permissions}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {isAdmin ? (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar usuario"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar usuario"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin permisos</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Name */}
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
              />

              {/* Email */}
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
              />

              {/* Phone with Country Code */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm text-gray-600">+1</span>
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder=""
                  className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                />
              </div>

              {/* Role and Status - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Role Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, role: true }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-sm bg-white appearance-none cursor-pointer transition-all ${
                      touched.role && !formData.role
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } ${formData.role ? "text-gray-900" : "text-gray-400"}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="view-only">View Only</option>
                  </select>
                  {touched.role && !formData.role && (
                    <p className="mt-1 text-xs text-red-500">
                      Role is required
                    </p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, status: true }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-sm bg-white appearance-none cursor-pointer transition-all ${
                      touched.status && !formData.status
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } ${formData.status ? "text-gray-900" : "text-gray-400"}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {touched.status && !formData.status && (
                    <p className="mt-1 text-xs text-red-500">
                      Status is required
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`
                  px-8 py-2.5 rounded-lg font-semibold transition-all
                  ${
                    isFormValid()
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={cancelDeleteUser}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-red-600">
                ⚠️ Eliminar Usuario
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>
                    ¿Estás seguro de que quieres eliminar este usuario?
                  </strong>
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Email: <strong>{userToDelete.email}</strong>
                </p>
                <p className="text-sm text-red-700">
                  Nombre: <strong>{userToDelete.name}</strong>
                </p>
                <p className="text-xs text-red-600 mt-3">
                  Esta acción es irreversible y eliminará permanentemente el
                  usuario de la base de datos.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para confirmar, escribe{" "}
                  <span className="font-bold text-red-600">DELETE</span>:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Escribe DELETE para confirmar"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={cancelDeleteUser}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-700 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleteConfirmation !== "DELETE"}
                className={`
                  px-8 py-2.5 rounded-lg font-semibold transition-all
                  ${
                    deleteConfirmation === "DELETE"
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
