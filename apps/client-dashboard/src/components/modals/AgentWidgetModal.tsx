import {
    CheckCircleIcon,
    PhotoIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useUploadAgentAvatar } from "../../hooks/useElevenLabs";

interface AgentWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onAvatarUploaded?: (avatarUrl: string) => void;
}

const AgentWidgetModal: React.FC<AgentWidgetModalProps> = ({
  isOpen,
  onClose,
  agentId,
  onAvatarUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const uploadMutation = useUploadAgentAvatar();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({
        agentId,
        avatarFile: selectedFile,
      });
      
      if (onAvatarUploaded && result.avatar_url) {
        onAvatarUploaded(result.avatar_url);
      }

      // Cerrar modal y limpiar estado
      onClose();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error al subir avatar:", error);
      alert("Error al subir el avatar. Por favor, inténtalo de nuevo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Subir Avatar del Agente
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Imagen
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-48 mx-auto rounded-lg object-cover"
                  />
                  <div className="mt-4 flex items-center justify-center text-green-600">
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    <span className="text-sm font-medium">
                      Imagen seleccionada
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Recomendaciones:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tamaño recomendado: 512x512 píxeles</li>
            <li>• Formato: PNG, JPG o GIF</li>
            <li>• El avatar aparecerá en el widget del agente</li>
            <li>• Tamaño máximo: 10MB</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={uploadMutation.isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadMutation.isPending ? "Subiendo..." : "Subir Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentWidgetModal;

