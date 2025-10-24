import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, CloudArrowUpIcon, DocumentArrowDownIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { apiClient } from "../../lib/api";
import Button from "../ui/Button";
const ContactWizardComplete = ({ isOpen, onClose, onComplete, }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [listName, setListName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [sortColumn, setSortColumn] = useState("columnName");
    const [sortDirection, setSortDirection] = useState("asc");
    const [columnMapping, setColumnMapping] = useState({});
    const [previewData, setPreviewData] = useState([]);
    const [fileColumns, setFileColumns] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);
    const steps = [
        { id: 1, name: "Getting Started", completed: currentStep > 1 },
        { id: 2, name: "Upload File", completed: currentStep > 2 },
        { id: 3, name: "Import Data", completed: currentStep > 3 },
    ];
    const columnOptions = ["", "email", "first_name", "last_name", "phone"];
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        }
        else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };
    const handleFileSelect = async (file) => {
        // Validate file type
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (!allowedTypes.includes(file.type)) {
            alert('Por favor selecciona un archivo CSV o Excel');
            return;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('El archivo no puede ser mayor a 10MB');
            return;
        }
        setSelectedFile(file);
        setIsProcessing(true);
        try {
            // Parse CSV/Excel file to preview
            const response = await apiClient.post('/contacts/import/preview', { fileName: file.name }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const preview = response.preview || [];
            setPreviewData(preview);
            // Auto-map columns based on content
            if (preview.length > 0) {
                const columns = Object.keys(preview[0]);
                setFileColumns(columns);
                const newMapping = {};
                columns.forEach((column) => {
                    const columnLower = column.toLowerCase();
                    if (columnLower.includes('name') || columnLower.includes('nombre')) {
                        newMapping[column] = 'first_name';
                    }
                    else if (columnLower.includes('email') || columnLower.includes('correo')) {
                        newMapping[column] = 'email';
                    }
                    else if (columnLower.includes('phone') || columnLower.includes('tel') || columnLower.includes('telefono')) {
                        newMapping[column] = 'phone';
                    }
                    else {
                        newMapping[column] = '';
                    }
                });
                setColumnMapping(newMapping);
            }
            setCurrentStep(2);
        }
        catch (error) {
            console.error('Error processing file:', error);
            alert('No se pudo procesar el archivo seleccionado');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleFileInputChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    const handleDragOver = (event) => {
        event.preventDefault();
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
        else {
            onComplete({
                listName,
                file: selectedFile,
                columnMapping,
                previewData,
            });
        }
    };
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, onClick: onClose, children: _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl w-full", style: { maxWidth: '2000px' }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Contact Wizard" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsx("div", { className: "px-4 py-4 border-b border-gray-200", children: _jsx("div", { className: "flex items-center justify-between", children: steps.map((step, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${step.completed
                                        ? "bg-blue-600 text-white"
                                        : step.id === currentStep
                                            ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                                            : "bg-gray-200 text-gray-600"}
                  `, children: step.completed ? (_jsx(CheckCircleIcon, { className: "h-5 w-5" })) : (step.id) }), _jsx("span", { className: `
                    ml-2 text-sm font-medium
                    ${step.id === currentStep ? "text-blue-600" : "text-gray-500"}
                  `, children: step.name }), index < steps.length - 1 && (_jsx("div", { className: "w-16 h-0.5 bg-gray-200 mx-4" }))] }, step.id))) }) }), _jsxs("div", { className: "p-4", children: [currentStep === 1 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-blue-600 mb-2", children: "Get ready to import your data" }), _jsx("p", { className: "text-sm text-gray-600", children: "The following columns are supported, some may be required and rest are optional." })] }), _jsxs(Button, { variant: "primary", onClick: async () => {
                                                try {
                                                    // Usar apiClient para mantener la autenticación
                                                    const response = await apiClient.get('/export-import/contacts/example');
                                                    // Crear blob URL y descargar
                                                    const blob = new Blob([response.data], { type: 'text/csv' });
                                                    const blobUrl = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = blobUrl;
                                                    link.download = 'contactos_ejemplo.csv';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    // Limpiar blob URL después de un delay
                                                    setTimeout(() => {
                                                        URL.revokeObjectURL(blobUrl);
                                                    }, 1000);
                                                }
                                                catch (error) {
                                                    console.error('Error downloading example:', error);
                                                    alert('Error al descargar el archivo de ejemplo');
                                                }
                                            }, className: "whitespace-nowrap", children: [_jsx(DocumentArrowDownIcon, { className: "w-4 h-4 mr-2" }), "Download Example"] })] }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg overflow-hidden", children: _jsxs("table", { className: "w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100", style: { width: '250px' }, onClick: () => handleSort("columnName"), children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { children: "Column Name" }), sortColumn === "columnName" && (_jsx("svg", { className: "w-4 h-4 ml-1 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: sortDirection === "asc" ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })) }))] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100", style: { width: '250px' }, onClick: () => handleSort("format"), children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { children: "Format" }), sortColumn === "format" && (_jsx("svg", { className: "w-4 h-4 ml-1 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: sortDirection === "asc" ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })) }))] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100", style: { width: '250px' }, onClick: () => handleSort("example"), children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { children: "example" }), sortColumn === "example" && (_jsx("svg", { className: "w-4 h-4 ml-1 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: sortDirection === "asc" ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })) }))] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100", style: { width: '500px' }, onClick: () => handleSort("description"), children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { children: "Description" }), sortColumn === "description" && (_jsx("svg", { className: "w-4 h-4 ml-1 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: sortDirection === "asc" ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })) }))] }) })] }) }), _jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "email" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '150px' }, children: "email" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "test@gmail.com" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '350px' }, children: "Lead Email" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "first_name" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '150px' }, children: "string" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "george" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '350px' }, children: "Lead First Name" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "last_name" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '150px' }, children: "string" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "Hinton" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '350px' }, children: "Lead Last Name" })] }), _jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "phone" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '150px' }, children: "regex" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '200px' }, children: "1232452123" }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap", style: { width: '350px' }, children: "Lead Phone Number" })] })] })] }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-700", children: "Rows per page:" }), _jsxs("select", { className: "px-2 py-1 border border-gray-300 rounded text-sm", children: [_jsx("option", { children: "5" }), _jsx("option", { children: "10" }), _jsx("option", { children: "25" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-sm text-gray-700", children: "1-4 of 4" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(ChevronLeftIcon, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(ChevronRightIcon, { className: "w-4 h-4" }) })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "primary", onClick: handleNext, children: "Next" }) })] })), currentStep === 2 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["List Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: listName, onChange: (e) => setListName(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm", placeholder: "Enter list name" })] }), _jsxs("div", { className: "relative", children: [selectedFile && (_jsx("div", { className: "absolute -top-2 right-0", children: _jsx("button", { onClick: () => {
                                                    setSelectedFile(null);
                                                    setPreviewData([]);
                                                    setFileColumns([]);
                                                    setColumnMapping({});
                                                }, className: "px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700", children: "Remove" }) })), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50", onDragOver: handleDragOver, onDrop: handleDrop, onClick: () => fileInputRef.current?.click(), children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".csv,.xlsx,.xls", onChange: handleFileInputChange, className: "hidden" }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4", children: _jsx(CloudArrowUpIcon, { className: "h-8 w-8 text-white" }) }), _jsx("h3", { className: "text-base font-medium text-gray-900 mb-2", children: "Drag & Drop or Select file" }), _jsxs("p", { className: "text-sm text-gray-500 mb-4", children: ["Drop files here or click", " ", _jsx("button", { className: "text-blue-600 hover:text-blue-700 underline", children: "browse" }), " ", "thorough your machine"] })] })] })] }), selectedFile && previewData.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-center", children: _jsx("p", { className: "text-sm text-gray-600", children: "If necessary match your columns by clicking the menu in each column header." }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: fileColumns.map((column) => (_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("span", { children: [column, " \u2192"] }), _jsx("select", { value: columnMapping[column] || '', onChange: (e) => setColumnMapping({
                                                                                ...columnMapping,
                                                                                [column]: e.target.value,
                                                                            }), className: "ml-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white", children: columnOptions.map((option) => (_jsx("option", { value: option, children: option || 'Select field...' }, option))) })] }) }, column))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: previewData.slice(0, 3).map((row, index) => (_jsx("tr", { children: fileColumns.map((column) => (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: row[column] }, column))) }, index))) })] }) }), _jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("span", { className: "text-sm text-gray-700", children: [Math.min(1, previewData.length), "-", Math.min(3, previewData.length), " of ", previewData.length] }), _jsxs("div", { className: "flex items-center space-x-1 ml-4", children: [_jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(ChevronLeftIcon, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(ChevronRightIcon, { className: "w-4 h-4" }) })] })] })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: handleBack, children: "Back" }), _jsxs("div", { className: "flex space-x-3", children: [_jsx(Button, { variant: "outline", children: "Match" }), _jsx(Button, { variant: "primary", onClick: handleNext, disabled: !selectedFile || !listName.trim(), children: "Next" })] })] })] })), currentStep === 3 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Review and Import" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Review your data mapping and proceed with the import." })] }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: fileColumns.map((column) => (_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: _jsx("div", { className: "flex items-center", children: _jsxs("span", { children: [column, " \u2192 ", columnMapping[column] || 'Not mapped'] }) }) }, column))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: previewData.slice(0, 5).map((row, index) => (_jsx("tr", { children: fileColumns.map((column) => (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: row[column] }, column))) }, index))) })] }) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-gray-700", children: [Math.min(1, previewData.length), "-", Math.min(5, previewData.length), " of ", previewData.length] }), _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(ChevronLeftIcon, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(ChevronRightIcon, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx(Button, { variant: "outline", onClick: handleBack, children: "Back" }), _jsx(Button, { variant: "primary", onClick: handleNext, children: "Import Contacts" })] })] })] }))] })] }) }));
};
export default ContactWizardComplete;
