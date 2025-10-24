import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EyeIcon, EyeSlashIcon, PencilIcon, PlusIcon, TrashIcon, } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useUsers } from "../hooks/useDashboard";
const Users = () => {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
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
    const isAdmin = currentUserRole === "admin" || currentUserRole === "super_admin";
    // Debug: verificar el rol del usuario
    console.log("🔍 Debug Users.tsx:", {
        userData,
        currentUser,
        currentUserRole,
        isAdmin,
    });
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Mark field as touched
        if (field === "role" || field === "status") {
            setTouched((prev) => ({ ...prev, [field]: true }));
        }
    };
    const isFormValid = () => {
        return (formData.name.trim() &&
            formData.email.trim() &&
            formData.phone.trim() &&
            formData.role &&
            formData.status &&
            formData.password.trim() &&
            formData.confirmPassword.trim() &&
            formData.password === formData.confirmPassword);
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
                }
                else {
                    const errorData = await response.json();
                    console.error("❌ Error creando usuario:", errorData);
                    alert(`Error creando usuario: ${errorData.message || "Error desconocido"}`);
                }
            }
            catch (error) {
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
    const handleEditUser = (user) => {
        // TODO: Implementar modal de edición
        console.log("Edit user:", user);
        alert(`Editar usuario: ${user.email}`);
    };
    const handleDeleteUser = (user) => {
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
            }
            else {
                const errorData = await response.json();
                console.error("❌ Error eliminando usuario:", errorData);
                alert(`Error eliminando usuario: ${errorData.message || "Error desconocido"}`);
            }
        }
        catch (error) {
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
        return (_jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Users" }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-8", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Cargando usuarios..." })] }) })] }));
    }
    // Mostrar error
    if (error) {
        return (_jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Users" }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-8", children: _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-red-600", children: ["Error al cargar usuarios: ", error.message] }) }) })] }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Users" }), isAdmin && (_jsxs("button", { onClick: () => setIsAddUserModalOpen(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium shadow-md hover:shadow-lg transition-all", children: [_jsx(PlusIcon, { className: "w-4 h-4 mr-2" }), "Add User"] }))] }) }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Permissions" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: user.email }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: user.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: user.permissions }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("span", { className: `inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"}`, children: user.status }) }), _jsx("td", { className: "px-6 py-4 text-sm", children: isAdmin ? (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => handleEditUser(user), className: "text-gray-400 hover:text-blue-600 transition-colors", title: "Editar usuario", children: _jsx(PencilIcon, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => handleDeleteUser(user), className: "text-gray-400 hover:text-red-600 transition-colors", title: "Eliminar usuario", children: _jsx(TrashIcon, { className: "w-5 h-5" }) })] })) : (_jsx("span", { className: "text-gray-400 text-xs", children: "Sin permisos" })) })] }, user.id))) })] }) }), isAddUserModalOpen && (_jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.3)" }, onClick: handleCloseModal, children: _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "px-6 py-5 border-b border-gray-200", children: _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Add New User" }) }), _jsxs("div", { className: "px-6 py-6 space-y-4", children: [_jsx("input", { type: "text", value: formData.name, onChange: (e) => handleInputChange("name", e.target.value), placeholder: "Name", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), placeholder: "Email", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2", children: [_jsx("span", { className: "text-lg", children: "\uD83C\uDDFA\uD83C\uDDF8" }), _jsx("span", { className: "text-sm text-gray-600", children: "+1" })] }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => handleInputChange("phone", e.target.value), placeholder: "", className: "w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Role" }), _jsxs("select", { value: formData.role, onChange: (e) => handleInputChange("role", e.target.value), onBlur: () => setTouched((prev) => ({ ...prev, role: true })), className: `w-full px-4 py-3 border rounded-lg focus:ring-2 text-sm bg-white appearance-none cursor-pointer transition-all ${touched.role && !formData.role
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} ${formData.role ? "text-gray-900" : "text-gray-400"}`, style: {
                                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                        backgroundPosition: "right 0.5rem center",
                                                        backgroundRepeat: "no-repeat",
                                                        backgroundSize: "1.5em 1.5em",
                                                        paddingRight: "2.5rem",
                                                    }, children: [_jsx("option", { value: "", children: "Role" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "view-only", children: "View Only" })] }), touched.role && !formData.role && (_jsx("p", { className: "mt-1 text-xs text-red-500", children: "Role is required" }))] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Status" }), _jsxs("select", { value: formData.status, onChange: (e) => handleInputChange("status", e.target.value), onBlur: () => setTouched((prev) => ({ ...prev, status: true })), className: `w-full px-4 py-3 border rounded-lg focus:ring-2 text-sm bg-white appearance-none cursor-pointer transition-all ${touched.status && !formData.status
                                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} ${formData.status ? "text-gray-900" : "text-gray-400"}`, style: {
                                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                        backgroundPosition: "right 0.5rem center",
                                                        backgroundRepeat: "no-repeat",
                                                        backgroundSize: "1.5em 1.5em",
                                                        paddingRight: "2.5rem",
                                                    }, children: [_jsx("option", { value: "", children: "Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] }), touched.status && !formData.status && (_jsx("p", { className: "mt-1 text-xs text-red-500", children: "Status is required" }))] })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? "text" : "password", value: formData.password, onChange: (e) => handleInputChange("password", e.target.value), placeholder: "Password", className: "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showPassword ? (_jsx(EyeSlashIcon, { className: "w-5 h-5" })) : (_jsx(EyeIcon, { className: "w-5 h-5" })) })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showConfirmPassword ? "text" : "password", value: formData.confirmPassword, onChange: (e) => handleInputChange("confirmPassword", e.target.value), placeholder: "Confirm Password", className: "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showConfirmPassword ? (_jsx(EyeSlashIcon, { className: "w-5 h-5" })) : (_jsx(EyeIcon, { className: "w-5 h-5" })) })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200", children: [_jsx("button", { onClick: handleCloseModal, className: "px-6 py-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: !isFormValid(), className: `
                  px-8 py-2.5 rounded-lg font-semibold transition-all
                  ${isFormValid()
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"}
                `, children: "Submit" })] })] }) })), isDeleteModalOpen && userToDelete && (_jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.3)" }, onClick: cancelDeleteUser, children: _jsxs("div", { className: "relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "px-6 py-5 border-b border-gray-200", children: _jsx("h2", { className: "text-xl font-bold text-red-600", children: "\u26A0\uFE0F Eliminar Usuario" }) }), _jsxs("div", { className: "px-6 py-6 space-y-4", children: [_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-red-800", children: _jsx("strong", { children: "\u00BFEst\u00E1s seguro de que quieres eliminar este usuario?" }) }), _jsxs("p", { className: "text-sm text-red-700 mt-2", children: ["Email: ", _jsx("strong", { children: userToDelete.email })] }), _jsxs("p", { className: "text-sm text-red-700", children: ["Nombre: ", _jsx("strong", { children: userToDelete.name })] }), _jsx("p", { className: "text-xs text-red-600 mt-3", children: "Esta acci\u00F3n es irreversible y eliminar\u00E1 permanentemente el usuario de la base de datos." })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Para confirmar, escribe", " ", _jsx("span", { className: "font-bold text-red-600", children: "DELETE" }), ":"] }), _jsx("input", { type: "text", value: deleteConfirmation, onChange: (e) => setDeleteConfirmation(e.target.value), placeholder: "Escribe DELETE para confirmar", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm placeholder-gray-400 transition-all" })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200", children: [_jsx("button", { onClick: cancelDeleteUser, className: "px-6 py-2.5 text-gray-600 hover:text-gray-700 font-semibold transition-colors", children: "Cancelar" }), _jsx("button", { onClick: confirmDeleteUser, disabled: deleteConfirmation !== "DELETE", className: `
                  px-8 py-2.5 rounded-lg font-semibold transition-all
                  ${deleteConfirmation === "DELETE"
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"}
                `, children: "Eliminar Usuario" })] })] }) }))] }));
};
export default Users;
