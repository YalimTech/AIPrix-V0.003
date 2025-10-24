import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, HomeIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import ContactWizardComplete from "../components/forms/ContactWizardComplete";
import Modal from "../components/ui/Modal";
import { useContactLists } from "../hooks/useContactLists";
import { apiClient } from "../lib/api";
import { useAppStore } from "../store/appStore";
const Contacts = () => {
    const [showContactWizard, setShowContactWizard] = useState(false);
    const [selectedList, setSelectedList] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    // const [importProgress, setImportProgress] = useState(0);
    // const [isImporting, setIsImporting] = useState(false);
    // const [importResults, setImportResults] = useState<{
    //   total: number;
    //   success: number;
    //   errors: number;
    //   errorsList: string[];
    // } | null>(null);
    const addNotification = useAppStore((state) => state.addNotification);
    // Obtener listas de contactos
    const { data: contactLists = [], isLoading: listsLoading, error: listsError } = useContactLists();
    // Datos mock temporales para desarrollo
    const mockContactLists = [
        { id: "1", name: "Lista Prospectos En Frio (Mayo 2024)", contactCount: 3 },
        { id: "2", name: "Clientes Activos", contactCount: 0 },
        { id: "3", name: "Leads Calientes", contactCount: 0 },
    ];
    const mockContacts = [
        {
            id: "1",
            name: "Juan",
            lastName: "Pérez",
            phone: "+52 55 1234 5678",
            email: "juan.perez@email.com",
            createdAt: "2024-05-15T10:30:00Z",
        },
        {
            id: "2",
            name: "Maria",
            lastName: "García",
            phone: "+52 55 9876 5432",
            email: "maria.garcia@email.com",
            createdAt: "2024-05-14T14:20:00Z",
        },
        {
            id: "3",
            name: "Carlos",
            lastName: "López",
            phone: "+52 55 5555 1234",
            email: "carlos.lopez@email.com",
            createdAt: "2024-05-13T09:15:00Z",
        },
    ];
    // Usar datos mock temporalmente
    const actualContactLists = listsLoading ? [] : (contactLists.length > 0 ? contactLists : mockContactLists);
    const actualContacts = selectedList === "1" ? mockContacts : [];
    const actualContactsLoading = false;
    // Seleccionar la primera lista por defecto
    React.useEffect(() => {
        if (actualContactLists.length > 0 && !selectedList) {
            setSelectedList(actualContactLists[0].id);
        }
    }, [actualContactLists, selectedList]);
    // const handleFileSelect = (file: File) => {
    //   setSelectedFile(file);
    //   setImportResults(null);
    // };
    // const handleImport = async () => {
    //   if (!selectedFile) return;
    //   setIsImporting(true);
    //   setImportProgress(0);
    //   try {
    //     // Simular proceso de importación
    //     const totalSteps = 100;
    //     for (let i = 0; i <= totalSteps; i++) {
    //       setImportProgress(i);
    //       await new Promise((resolve) => setTimeout(resolve, 50));
    //     }
    //     // Simular resultados
    //     const results = {
    //       total: 150,
    //       success: 145,
    //       errors: 5,
    //       errorsList: [
    //         "Fila 12: Email inválido",
    //         "Fila 23: Teléfono faltante",
    //         "Fila 45: Nombre duplicado",
    //         "Fila 67: Formato de teléfono incorrecto",
    //         "Fila 89: Email duplicado",
    //       ],
    //     };
    //     setImportResults(results);
    //     setShowContactWizard(false);
    //     if (results.errors === 0) {
    //       addNotification({
    //         type: "success",
    //         title: "Importación exitosa",
    //         message: `Se importaron ${results.success} contactos correctamente`,
    //       });
    //     } else {
    //       addNotification({
    //         type: "warning",
    //         title: "Importación parcial",
    //         message: `Se importaron ${results.success} de ${results.total} contactos. ${results.errors} fallaron.`,
    //       });
    //     }
    //   } catch (error) {
    //     addNotification({
    //       type: "error",
    //       title: "Error en importación",
    //       message: "No se pudo importar el archivo",
    //     });
    //   } finally {
    //     setIsImporting(false);
    //   }
    // };
    // const resetImport = () => {
    //   setSelectedFile(null);
    //   setImportProgress(0);
    //   setImportResults(null);
    //   setIsImporting(false);
    // };
    // Manejar estados de carga y error
    if (actualContactsLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(UserGroupIcon, { className: "w-6 h-6 mr-2" }), "Contacts"] }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Loading contact lists..." })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "h-16 bg-gray-200 rounded" }, i))) }) })] }));
    }
    // Manejar error de autenticación solo si realmente es un error de autenticación
    // y no solo un error de red o conexión
    if (listsError &&
        (listsError.status === 401 || listsError.code === 'NOT_AUTHENTICATED') &&
        listsError.message !== 'Tenant no especificado') {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(UserGroupIcon, { className: "w-8 h-8 text-red-600" }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Acceso Requerido" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Necesitas iniciar sesi\u00F3n para acceder a tus contactos." }), _jsx("button", { onClick: () => window.location.href = '/login', className: "w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors", children: "Ir al Login" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "flex items-center justify-between mb-6", children: _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx(HomeIcon, { className: "w-4 h-4 mr-1" }), _jsx("span", { className: "mr-2", children: "Home" }), _jsx("span", { className: "mr-2", children: "\u203A" }), _jsx("span", { className: "text-gray-900", children: "Contacts" })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Contacts" }) }), _jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "w-72", children: _jsxs("select", { value: selectedList || "", onChange: (e) => setSelectedList(e.target.value || null), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-600 appearance-none cursor-pointer", style: {
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }, disabled: false, children: [_jsx("option", { value: "", children: "Select List" }), actualContactLists.map((list) => (_jsxs("option", { value: list.id, children: [list.name, " (", list.contactCount, ")"] }, list.id)))] }) }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: async () => {
                                                if (confirm('¿Estás seguro de que quieres eliminar todos los contactos? Esta acción no se puede deshacer.')) {
                                                    try {
                                                        await apiClient.delete('/contacts/clear-all');
                                                        addNotification({
                                                            type: "success",
                                                            title: "Contactos eliminados",
                                                            message: "Todos los contactos han sido eliminados exitosamente",
                                                        });
                                                        // Usar invalidateQueries en lugar de recarga completa
                                                        // window.location.reload();
                                                    }
                                                    catch (error) {
                                                        console.error('Error eliminando contactos:', error);
                                                        addNotification({
                                                            type: "error",
                                                            title: "Error al eliminar",
                                                            message: "No se pudieron eliminar los contactos",
                                                        });
                                                    }
                                                }
                                            }, className: "px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center", children: [_jsx(TrashIcon, { className: "w-4 h-4 mr-2" }), "Delete List"] }), _jsx("button", { onClick: () => setShowContactWizard(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium", children: "Import" })] })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: _jsxs("div", { className: "flex items-center", children: ["Name", _jsx(ChevronUpIcon, { className: "w-4 h-4 ml-1 text-gray-400" })] }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Phone" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Created At" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: actualContactsLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-sm text-gray-500", children: "Loading contacts..." }) })) : actualContacts.length > 0 ? (actualContacts.map((contact) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [contact.name, " ", contact.lastName && contact.lastName] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: contact.phone }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: contact.email || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(contact.createdAt).toLocaleDateString() })] }, contact.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-sm text-gray-500", children: "No contacts found in this list" }) })) })] }) }), _jsx("div", { className: "px-6 py-4 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Rows per page:", " ", _jsxs("select", { className: "ml-1 border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "10", children: "10" }), _jsx("option", { value: "25", children: "25" }), _jsx("option", { value: "50", children: "50" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: actualContacts.length > 0
                                                ? `1-${actualContacts.length} of ${actualContacts.length}`
                                                : "0-0 of 0" }), _jsx("button", { className: "p-1 rounded hover:bg-gray-100", children: _jsx(ChevronLeftIcon, { className: "w-4 h-4 text-gray-400" }) }), _jsx("button", { className: "p-1 rounded hover:bg-gray-100", children: _jsx(ChevronRightIcon, { className: "w-4 h-4 text-gray-400" }) })] })] }) })] }), _jsx(Modal, { title: "Import Contacts", isOpen: showContactWizard, onClose: () => {
                    setShowContactWizard(false);
                    // resetImport();
                }, children: _jsx(ContactWizardComplete, { isOpen: showContactWizard, onClose: () => {
                        setShowContactWizard(false);
                        // resetImport();
                    }, onComplete: (data) => {
                        console.log("Wizard completed with data:", data);
                        setShowContactWizard(false);
                        // resetImport();
                    } }) })] }));
};
export default Contacts;
