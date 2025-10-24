import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useRef, useState } from "react";
import { apiClient } from "../../lib/api";
import Button from "../ui/Button";

interface ContactWizardCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

const ContactWizardComplete: React.FC<ContactWizardCompleteProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [listName, setListName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortColumn, setSortColumn] = useState<
    "columnName" | "format" | "example" | "description"
  >("columnName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, name: "Getting Started", completed: currentStep > 1 },
    { id: 2, name: "Upload File", completed: currentStep > 2 },
    { id: 3, name: "Import Data", completed: currentStep > 3 },
  ];

  const columnOptions = ["", "email", "first_name", "last_name", "phone"];

  const handleSort = (
    column: "columnName" | "format" | "example" | "description",
  ) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleFileSelect = async (file: File) => {
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
      
      const preview = (response as { preview?: Record<string, string>[] }).preview || [];
      setPreviewData(preview);
      
      // Auto-map columns based on content
      if (preview.length > 0) {
        const columns = Object.keys(preview[0]);
        setFileColumns(columns);
        const newMapping: Record<string, string> = {};
        
        columns.forEach((column) => {
          const columnLower = column.toLowerCase();
          if (columnLower.includes('name') || columnLower.includes('nombre')) {
            newMapping[column] = 'first_name';
          } else if (columnLower.includes('email') || columnLower.includes('correo')) {
            newMapping[column] = 'email';
          } else if (columnLower.includes('phone') || columnLower.includes('tel') || columnLower.includes('telefono')) {
            newMapping[column] = 'phone';
          } else {
            newMapping[column] = '';
          }
        });
        
        setColumnMapping(newMapping);
      }
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('No se pudo procesar el archivo seleccionado');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-full"
        style={{ maxWidth: '2000px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Contact Wizard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      step.completed
                        ? "bg-blue-600 text-white"
                        : step.id === currentStep
                          ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  {step.completed ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`
                    ml-2 text-sm font-medium
                    ${step.id === currentStep ? "text-blue-600" : "text-gray-500"}
                  `}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Title and Download Example */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Get ready to import your data
                  </h3>
                  <p className="text-sm text-gray-600">
                    The following columns are supported, some may be required
                    and rest are optional.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      // Usar apiClient para mantener la autenticación
                      const response = await apiClient.get('/export-import/contacts/example') as any;
                      
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
                    } catch (error) {
                      console.error('Error downloading example:', error);
                      alert('Error al descargar el archivo de ejemplo');
                    }
                  }}
                  className="whitespace-nowrap"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Download Example
                </Button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ width: '250px' }}
                        onClick={() => handleSort("columnName")}
                      >
                        <div className="flex items-center">
                          <span>Column Name</span>
                          {sortColumn === "columnName" && (
                            <svg
                              className="w-4 h-4 ml-1 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {sortDirection === "asc" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ width: '250px' }}
                        onClick={() => handleSort("format")}
                      >
                        <div className="flex items-center">
                          <span>Format</span>
                          {sortColumn === "format" && (
                            <svg
                              className="w-4 h-4 ml-1 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {sortDirection === "asc" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ width: '250px' }}
                        onClick={() => handleSort("example")}
                      >
                        <div className="flex items-center">
                          <span>example</span>
                          {sortColumn === "example" && (
                            <svg
                              className="w-4 h-4 ml-1 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {sortDirection === "asc" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ width: '500px' }}
                        onClick={() => handleSort("description")}
                      >
                        <div className="flex items-center">
                          <span>Description</span>
                          {sortColumn === "description" && (
                            <svg
                              className="w-4 h-4 ml-1 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {sortDirection === "asc" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>email</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '150px' }}>email</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>
                        test@gmail.com
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '350px' }}>
                        Lead Email
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>
                        first_name
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '150px' }}>
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>
                        george
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '350px' }}>
                        Lead First Name
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>
                        last_name
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '150px' }}>
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>
                        Hinton
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '350px' }}>
                        Lead Last Name
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>phone</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '150px' }}>regex</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '200px' }}>
                        1232452123
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" style={{ width: '350px' }}>
                        Lead Phone Number
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option>5</option>
                    <option>10</option>
                    <option>25</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">1-4 of 4</span>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* List Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter list name"
                />
              </div>

              {/* Drag & Drop Area with Remove Button */}
              <div className="relative">
                {selectedFile && (
                  <div className="absolute -top-2 right-0">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewData([]);
                        setFileColumns([]);
                        setColumnMapping({});
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                      <CloudArrowUpIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Drag & Drop or Select file
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Drop files here or click{" "}
                      <button className="text-blue-600 hover:text-blue-700 underline">
                        browse
                      </button>{" "}
                      thorough your machine
                    </p>
                  </div>
                </div>
              </div>

              {/* Column Mapping Section */}
              {selectedFile && previewData.length > 0 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      If necessary match your columns by clicking the menu in each column header.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {fileColumns.map((column) => (
                            <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center">
                                <span>{column} →</span>
                                <select
                                  value={columnMapping[column] || ''}
                                  onChange={(e) =>
                                    setColumnMapping({
                                      ...columnMapping,
                                      [column]: e.target.value,
                                    })
                                  }
                                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                                >
                                  {columnOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option || 'Select field...'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 3).map((row, index) => (
                          <tr key={index}>
                            {fileColumns.map((column) => (
                              <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {row[column]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Preview */}
                  <div className="flex items-center justify-center">
                    <span className="text-sm text-gray-700">
                      {Math.min(1, previewData.length)}-{Math.min(3, previewData.length)} of {previewData.length}
                    </span>
                    <div className="flex items-center space-x-1 ml-4">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    Match
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!selectedFile || !listName.trim()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Review and Import
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Review your data mapping and proceed with the import.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {fileColumns.map((column) => (
                        <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <span>{column} → {columnMapping[column] || 'Not mapped'}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {fileColumns.map((column) => (
                          <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {Math.min(1, previewData.length)}-{Math.min(5, previewData.length)} of {previewData.length}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Import Contacts
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactWizardComplete;
