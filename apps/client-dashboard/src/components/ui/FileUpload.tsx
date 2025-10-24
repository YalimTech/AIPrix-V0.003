import React, { useRef, useState, useCallback } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
  autoUpload?: boolean;
  uploadEndpoint?: string;
  maxFiles?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  acceptedTypes = ['.csv', '.xlsx', '.xls'],
  maxSize = 10,
  disabled = false,
  className = '',
  multiple = false,
  autoUpload = false,
  uploadEndpoint,
  maxFiles = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Tipo de archivo no válido. Tipos permitidos: ${acceptedTypes.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`);
      return false;
    }

    // Check if we already have this file
    if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
      setError('Este archivo ya ha sido seleccionado');
      return false;
    }

    // Check max files limit
    if (selectedFiles.length >= maxFiles) {
      setError(`Máximo ${maxFiles} archivo(s) permitido(s)`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      const newFiles = multiple ? [...selectedFiles, file] : [file];
      setSelectedFiles(newFiles);
      onFileSelect(file);
      
      if (autoUpload && uploadEndpoint) {
        uploadFile(file);
      }
    }
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!uploadEndpoint) return;

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadStatus('success');
          const result = JSON.parse(xhr.responseText);
          onUploadComplete?.(result);
        } else {
          setUploadStatus('error');
          onUploadError?.(`Error ${xhr.status}: ${xhr.statusText}`);
        }
        setUploading(false);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploadStatus('error');
        onUploadError?.('Error de red durante la subida');
        setUploading(false);
      });

      xhr.open('POST', uploadEndpoint);
      
      // Add authentication headers
      const token = localStorage.getItem('auth_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    } catch (error) {
      setUploadStatus('error');
      onUploadError?.(error instanceof Error ? error.message : 'Error desconocido');
      setUploading(false);
    }
  }, [uploadEndpoint, onUploadProgress, onUploadComplete, onUploadError]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (multiple || selectedFiles.length === 0) {
        handleFileSelect(file);
      }
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (multiple || selectedFiles.length === 0) {
        handleFileSelect(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setError(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    setError(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          multiple={multiple}
        />

        {selectedFiles.length > 0 ? (
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-6 w-6 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploading && index === selectedFiles.length - 1 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{uploadProgress}% subido</p>
                      </div>
                    )}
                    {uploadStatus === 'success' && index === selectedFiles.length - 1 && (
                      <div className="flex items-center mt-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">Subido exitosamente</span>
                      </div>
                    )}
                    {uploadStatus === 'error' && index === selectedFiles.length - 1 && (
                      <div className="flex items-center mt-1">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-xs text-red-600">Error en la subida</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={uploading}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {multiple && selectedFiles.length < maxFiles && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  disabled={uploading}
                >
                  Agregar más archivos
                </Button>
              </div>
            )}
            {selectedFiles.length > 1 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAllFiles();
                  }}
                  disabled={uploading}
                >
                  Limpiar todos
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                Arrastra y suelta tu archivo aquí
              </p>
              <p className="text-xs text-gray-500 mt-1">
                o haz clic para seleccionar un archivo
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Tipos permitidos: {acceptedTypes.join(', ')} (máx. {maxSize}MB)
                {multiple && ` • Máximo ${maxFiles} archivo(s)`}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
