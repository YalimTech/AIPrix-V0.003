import React, { useState } from "react";
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import CreateAccountModal from "../components/modals/CreateAccountModal";
import EditAccountModal from "../components/modals/EditAccountModal";
import ConfirmActionModal from "../components/modals/ConfirmActionModal";

interface Account {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  timezone: string;
  status: string;
  subscriptionPlan: string;
  billingEmail?: string;
  createdAt: string;
  _count?: {
    users: number;
    agents: number;
    campaigns: number;
    contacts: number;
  };
}

const Accounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "activate" | "delete";
    title: string;
    message: string;
    confirmText: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const accounts: Account[] = [
    {
      id: "1",
      name: "TechCorp",
      slug: "techcorp",
      email: "admin@techcorp.com",
      phone: "+1 (555) 123-4567",
      timezone: "America/New_York",
      status: "active",
      subscriptionPlan: "pro",
      billingEmail: "billing@techcorp.com",
      createdAt: "2024-01-15",
      _count: {
        users: 45,
        agents: 12,
        campaigns: 8,
        contacts: 1250,
      },
    },
    {
      id: "2",
      name: "StartupXYZ",
      slug: "startupxyz",
      email: "admin@startupxyz.com",
      phone: "+1 (555) 987-6543",
      timezone: "America/Los_Angeles",
      status: "active",
      subscriptionPlan: "enterprise",
      billingEmail: "billing@startupxyz.com",
      createdAt: "2024-02-20",
      _count: {
        users: 32,
        agents: 8,
        campaigns: 15,
        contacts: 890,
      },
    },
    {
      id: "3",
      name: "Empresa ABC",
      slug: "empresa-abc",
      email: "admin@empresaabc.com",
      phone: "+34 91 123 4567",
      timezone: "Europe/Madrid",
      status: "suspended",
      subscriptionPlan: "basic",
      billingEmail: "billing@empresaabc.com",
      createdAt: "2024-03-10",
      _count: {
        users: 28,
        agents: 5,
        campaigns: 3,
        contacts: 450,
      },
    },
    {
      id: "4",
      name: "InnovateLab",
      slug: "innovatelab",
      email: "admin@innovatelab.com",
      phone: "+1 (555) 456-7890",
      timezone: "UTC",
      status: "active",
      subscriptionPlan: "pro",
      billingEmail: "billing@innovatelab.com",
      createdAt: "2024-03-25",
      _count: {
        users: 24,
        agents: 6,
        campaigns: 4,
        contacts: 320,
      },
    },
  ];

  const filteredAccounts = accounts.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || tenant.status === statusFilter;
    const matchesPlan = !planFilter || tenant.subscriptionPlan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Funciones de manejo
  const handleCreateAccount = async (tenantData: any) => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada a la API
      console.log("Creating tenant:", tenantData);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowCreateModal(false);
      // Aquí se actualizaría la lista de accounts
    } catch (error) {
      console.error("Error creating tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAccount = async (tenantData: any) => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada a la API
      console.log("Updating tenant:", selectedAccount?.id, tenantData);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowEditModal(false);
      setSelectedAccount(null);
      // Aquí se actualizaría la lista de accounts
    } catch (error) {
      console.error("Error updating tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountAction = (
    tenant: Account,
    action: "suspend" | "activate" | "delete",
  ) => {
    setSelectedAccount(tenant);

    switch (action) {
      case "suspend":
        setConfirmAction({
          type: "suspend",
          title: "Suspender Account",
          message: `¿Estás seguro de que quieres suspender "${tenant.name}"? El tenant no podrá acceder a sus servicios hasta que sea reactivado.`,
          confirmText: "Suspender",
        });
        break;
      case "activate":
        setConfirmAction({
          type: "activate",
          title: "Activar Account",
          message: `¿Estás seguro de que quieres activar "${tenant.name}"? El tenant podrá acceder a todos sus servicios.`,
          confirmText: "Activar",
        });
        break;
      case "delete":
        setConfirmAction({
          type: "delete",
          title: "Eliminar Account",
          message: `¿Estás seguro de que quieres eliminar "${tenant.name}"? Esta acción no se puede deshacer y eliminará todos los datos asociados.`,
          confirmText: "Eliminar",
        });
        break;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAccount || !confirmAction) return;

    setIsLoading(true);
    try {
      // Aquí irían las llamadas a la API según el tipo de acción
      console.log(
        `Performing ${confirmAction.type} on tenant:`,
        selectedAccount.id,
      );
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowConfirmModal(false);
      setSelectedAccount(null);
      setConfirmAction(null);
      // Aquí se actualizaría la lista de accounts
    } catch (error) {
      console.error(`Error ${confirmAction.type}ing tenant:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (tenant: Account) => {
    setSelectedAccount(tenant);
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "pro":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "suspended":
        return "Suspendido";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getPlanText = (plan: string) => {
    switch (plan) {
      case "basic":
        return "Basic";
      case "pro":
        return "Pro";
      case "enterprise":
        return "Enterprise";
      default:
        return plan;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all tenant organizations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Crear Account
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Planes</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los Estados</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.slug}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(tenant.subscriptionPlan)}`}
                    >
                      {getPlanText(tenant.subscriptionPlan)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant._count?.users || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant._count?.agents || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}
                    >
                      {getStatusText(tenant.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(tenant)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      {tenant.status === "active" ? (
                        <button
                          onClick={() => handleAccountAction(tenant, "suspend")}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title="Suspender"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleAccountAction(tenant, "activate")
                          }
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Activar"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleAccountAction(tenant, "delete")}
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

      {/* Modals */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAccount}
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAccount(null);
        }}
        onSave={handleEditAccount}
        tenant={selectedAccount}
      />

      <ConfirmActionModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedAccount(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
        confirmText={confirmAction?.confirmText || ""}
        type={confirmAction?.type === "delete" ? "danger" : "warning"}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Accounts;
