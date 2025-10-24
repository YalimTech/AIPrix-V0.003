import {
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { apiClient } from "../../lib/api";
import { useAppStore } from "../../store/appStore";
import Button from "../ui/Button";

interface ContactImportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

interface ColumnMapping {
  [key: string]: string;
}

const ContactImportForm: React.FC<ContactImportFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [listName, setListName] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "mapping" | "review" | "result"
  >("upload");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    mutationFn: async (data: {
      file: File;
      columnMapping: ColumnMapping;
      listName: string;
    }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("columnMapping", JSON.stringify(data.columnMapping));
      formData.append("listName", data.listName);

      return apiClient.post<ImportResult>(
        "/export-import/contacts/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
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
      } else {
        addNotification({
          type: "warning",
          title: "Importación parcial",
          message: `Se importaron ${result.successful} de ${result.total} contactos. ${result.failed} fallaron.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (error: Error) => {
      addNotification({
        type: "error",
        title: "Error en importación",
        message: error.message || "No se pudo importar el archivo",
      });
    },
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

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
      const response = await apiClient.post(
        "/contacts/import/preview",
        { fileName: selectedFile.name },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setPreview(
        (response as { preview?: Record<string, string>[] }).preview || [],
      );
      setCurrentStep("mapping");
    } catch {
      addNotification({
        type: "error",
        title: "Error al procesar archivo",
        message: "No se pudo procesar el archivo seleccionado",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColumnMapping = (fieldKey: string, columnIndex: number) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fieldKey]: preview[0] ? Object.keys(preview[0])[columnIndex] : "",
    }));
  };

  const validateMapping = () => {
    const requiredFields = availableFields.filter((field) => field.required);
    const mappedRequiredFields = requiredFields.filter(
      (field) => columnMapping[field.key],
    );

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-blue-600" />
            Importar Contactos
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Instrucciones
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Sube un archivo CSV o Excel con los datos de tus contactos
              </li>
              <li>
                • Los campos requeridos son: Nombre, Apellido, Email y Teléfono
              </li>
              <li>• El archivo debe tener un máximo de 10MB</li>
              <li>
                • Puedes descargar un{" "}
                <a href="/templates/contact-template.csv" className="underline">
                  archivo de ejemplo
                </a>
              </li>
            </ul>
          </div>

          {/* Step 1: File Upload */}
          {currentStep === "upload" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un archivo
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="primary"
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "Seleccionar archivo"}
              </Button>

              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Archivo seleccionado:</strong> {file.name} (
                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {currentStep === "mapping" && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                Mapear columnas
              </h4>
              <p className="text-sm text-gray-600">
                Asocia las columnas de tu archivo con los campos del sistema
              </p>

              {/* List Name Input */}
              <div className="space-y-2">
                <label
                  htmlFor="listName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de la lista *
                </label>
                <input
                  type="text"
                  id="listName"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Ej: Clientes VIP, Prospectos 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-sm font-medium text-gray-900">
                    Vista previa (primeras 3 filas)
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview[0] &&
                          Object.keys(preview[0]).map((_column, index) => (
                            <th
                              key={index}
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                            >
                              Columna {index + 1}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-2 text-sm text-gray-900"
                            >
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Field Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      value={columnMapping[field.key] || ""}
                      onChange={(e) => {
                        const columnIndex = e.target.selectedIndex - 1;
                        if (columnIndex >= 0) {
                          handleColumnMapping(field.key, columnIndex);
                        }
                      }}
                      className="input-field"
                      required={field.required}
                    >
                      <option value="">Seleccionar columna</option>
                      {preview[0] &&
                        Object.keys(preview[0]).map((column, index) => (
                          <option key={index} value={column}>
                            Columna {index + 1}: {column}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button onClick={resetForm} variant="outline">
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  variant="primary"
                  disabled={!validateMapping()}
                  isLoading={importContacts.isPending}
                >
                  {importContacts.isPending
                    ? "Importando..."
                    : "Importar Contactos"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Import Results */}
          {currentStep === "result" && importResult && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                Resultado de la importación
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Exitosos
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {importResult.successful}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Fallidos
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {importResult.failed}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentArrowUpIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {importResult.total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-red-900 mb-2">
                    Errores encontrados
                  </h5>
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">
                        Fila {error.row}: {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button onClick={resetForm} variant="outline">
                  Importar más
                </Button>
                <Button
                  onClick={() => {
                    onSuccess?.();
                    onClose();
                  }}
                  variant="primary"
                >
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactImportForm;
