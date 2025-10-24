import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircleIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { apiClient } from "../../lib/api";
import { useAppStore } from "../../store/appStore";
import Button from "../ui/Button";
const ContactImportForm = ({ isOpen, onClose, onSuccess, }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [columnMapping, setColumnMapping] = useState({});
    const [listName, setListName] = useState("");
    const [importResult, setImportResult] = useState(null);
    const [currentStep, setCurrentStep] = useState("upload");
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();
    const addNotification = useAppStore((state) => state.addNotification);
    const availableFields = [
        { key: "firstName", label: "Nombre", required: true },
        { key: "lastName", label: "Apellido", required: true },
        { key: "email", label: "Email", required: true },
        { key: "phone", label: "Teléfono", required: true },
        { key: "company", label: "Empresa", required: false },
        { key: "position", label: "Posición", required: false },
        { key: "source", label: "Fuente", required: false },
        { key: "notes", label: "Notas", required: false },
    ];
    const importContacts = useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();
            formData.append("file", data.file);
            formData.append("columnMapping", JSON.stringify(data.columnMapping));
            formData.append("listName", data.listName);
            return apiClient.post("/export-import/contacts/import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: (result) => {
            setImportResult(result);
            setCurrentStep("result");
            if (result.failed === 0) {
                addNotification({
                    type: "success",
                    title: "Importación exitosa",
                    message: `Se importaron ${result.successful} contactos correctamente`,
                });
            }
            else {
                addNotification({
                    type: "warning",
                    title: "Importación parcial",
                    message: `Se importaron ${result.successful} de ${result.total} contactos. ${result.failed} fallaron.`,
                });
            }
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
        },
        onError: (error) => {
            addNotification({
                type: "error",
                title: "Error en importación",
                message: error.message || "No se pudo importar el archivo",
            });
        },
    });
    const handleFileSelect = async (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile)
            return;
        // Validate file type
        const allowedTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (!allowedTypes.includes(selectedFile.type)) {
            addNotification({
                type: "error",
                title: "Tipo de archivo inválido",
                message: "Por favor selecciona un archivo CSV o Excel",
            });
            return;
        }
        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            addNotification({
                type: "error",
                title: "Archivo muy grande",
                message: "El archivo no puede ser mayor a 10MB",
            });
            return;
        }
        setFile(selectedFile);
        setIsProcessing(true);
        try {
            // Parse CSV/Excel file to preview
            const response = await apiClient.post("/contacts/import/preview", { fileName: selectedFile.name }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setPreview(response.preview || []);
            setCurrentStep("mapping");
        }
        catch {
            addNotification({
                type: "error",
                title: "Error al procesar archivo",
                message: "No se pudo procesar el archivo seleccionado",
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleColumnMapping = (fieldKey, columnIndex) => {
        setColumnMapping((prev) => ({
            ...prev,
            [fieldKey]: preview[0] ? Object.keys(preview[0])[columnIndex] : "",
        }));
    };
    const validateMapping = () => {
        const requiredFields = availableFields.filter((field) => field.required);
        const mappedRequiredFields = requiredFields.filter((field) => columnMapping[field.key]);
        return mappedRequiredFields.length === requiredFields.length;
    };
    const handleImport = async () => {
        if (!file || !validateMapping()) {
            addNotification({
                type: "warning",
                title: "Mapeo incompleto",
                message: "Por favor mapea todos los campos requeridos",
            });
            return;
        }
        await importContacts.mutateAsync({ file, columnMapping, listName });
    };
    const resetForm = () => {
        setFile(null);
        setPreview([]);
        setColumnMapping({});
        setListName("");
        setImportResult(null);
        setCurrentStep("upload");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content max-w-4xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(DocumentArrowUpIcon, { className: "w-5 h-5 mr-2 text-blue-600" }), "Importar Contactos"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-blue-900 mb-2", children: "Instrucciones" }), _jsxs("ul", { className: "text-sm text-blue-700 space-y-1", children: [_jsx("li", { children: "\u2022 Sube un archivo CSV o Excel con los datos de tus contactos" }), _jsx("li", { children: "\u2022 Los campos requeridos son: Nombre, Apellido, Email y Tel\u00E9fono" }), _jsx("li", { children: "\u2022 El archivo debe tener un m\u00E1ximo de 10MB" }), _jsxs("li", { children: ["\u2022 Puedes descargar un", " ", _jsx("a", { href: "/templates/contact-template.csv", className: "underline", children: "archivo de ejemplo" })] })] })] }), currentStep === "upload" && (_jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center", children: [_jsx(DocumentArrowUpIcon, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h4", { className: "text-lg font-medium text-gray-900 mb-2", children: "Selecciona un archivo" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Arrastra y suelta tu archivo aqu\u00ED, o haz clic para seleccionar" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".csv,.xlsx,.xls", onChange: handleFileSelect, className: "hidden" }), _jsx(Button, { onClick: () => fileInputRef.current?.click(), variant: "primary", isLoading: isProcessing, disabled: isProcessing, children: isProcessing ? "Procesando..." : "Seleccionar archivo" }), file && (_jsx("div", { className: "mt-4 p-3 bg-gray-50 rounded-lg", children: _jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("strong", { children: "Archivo seleccionado:" }), " ", file.name, " (", (file.size / 1024 / 1024).toFixed(2), " MB)"] }) }))] })), currentStep === "mapping" && (_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Mapear columnas" }), _jsx("p", { className: "text-sm text-gray-600", children: "Asocia las columnas de tu archivo con los campos del sistema" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "listName", className: "block text-sm font-medium text-gray-700", children: "Nombre de la lista *" }), _jsx("input", { type: "text", id: "listName", value: listName, onChange: (e) => setListName(e.target.value), placeholder: "Ej: Clientes VIP, Prospectos 2024", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-4 py-2 border-b border-gray-200", children: _jsx("h5", { className: "text-sm font-medium text-gray-900", children: "Vista previa (primeras 3 filas)" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: preview[0] &&
                                                                Object.keys(preview[0]).map((_column, index) => (_jsxs("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase", children: ["Columna ", index + 1] }, index))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: preview.slice(0, 3).map((row, rowIndex) => (_jsx("tr", { children: Object.values(row).map((value, colIndex) => (_jsx("td", { className: "px-4 py-2 text-sm text-gray-900", children: String(value) }, colIndex))) }, rowIndex))) })] }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: availableFields.map((field) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [field.label, " ", field.required && (_jsx("span", { className: "text-red-500", children: "*" }))] }), _jsxs("select", { value: columnMapping[field.key] || "", onChange: (e) => {
                                                    const columnIndex = e.target.selectedIndex - 1;
                                                    if (columnIndex >= 0) {
                                                        handleColumnMapping(field.key, columnIndex);
                                                    }
                                                }, className: "input-field", required: field.required, children: [_jsx("option", { value: "", children: "Seleccionar columna" }), preview[0] &&
                                                        Object.keys(preview[0]).map((column, index) => (_jsxs("option", { value: column, children: ["Columna ", index + 1, ": ", column] }, index)))] })] }, field.key))) }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { onClick: resetForm, variant: "outline", children: "Cancelar" }), _jsx(Button, { onClick: handleImport, variant: "primary", disabled: !validateMapping(), isLoading: importContacts.isPending, children: importContacts.isPending
                                                ? "Importando..."
                                                : "Importar Contactos" })] })] })), currentStep === "result" && importResult && (_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Resultado de la importaci\u00F3n" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(CheckCircleIcon, { className: "w-8 h-8 text-green-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Exitosos" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: importResult.successful })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ExclamationTriangleIcon, { className: "w-8 h-8 text-yellow-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Fallidos" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: importResult.failed })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(DocumentArrowUpIcon, { className: "w-8 h-8 text-blue-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: importResult.total })] })] }) })] }), importResult.errors.length > 0 && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h5", { className: "text-sm font-medium text-red-900 mb-2", children: "Errores encontrados" }), _jsx("div", { className: "max-h-32 overflow-y-auto", children: importResult.errors.map((error, index) => (_jsxs("p", { className: "text-sm text-red-700", children: ["Fila ", error.row, ": ", error.error] }, index))) })] })), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { onClick: resetForm, variant: "outline", children: "Importar m\u00E1s" }), _jsx(Button, { onClick: () => {
                                                onSuccess?.();
                                                onClose();
                                            }, variant: "primary", children: "Finalizar" })] })] }))] })] }) }));
};
export default ContactImportForm;
