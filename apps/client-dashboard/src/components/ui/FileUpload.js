import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';
const FileUpload = ({ onFileSelect, onUploadProgress, onUploadComplete, onUploadError, acceptedTypes = ['.csv', '.xlsx', '.xls'], maxSize = 10, disabled = false, className = '', multiple = false, autoUpload = false, uploadEndpoint, maxFiles = 1, }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle');
    const validateFile = (file) => {
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
    const handleFileSelect = (file) => {
        if (validateFile(file)) {
            const newFiles = multiple ? [...selectedFiles, file] : [file];
            setSelectedFiles(newFiles);
            onFileSelect(file);
            if (autoUpload && uploadEndpoint) {
                uploadFile(file);
            }
        }
    };
    const uploadFile = useCallback(async (file) => {
        if (!uploadEndpoint)
            return;
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
                }
                else {
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
        }
        catch (error) {
            setUploadStatus('error');
            onUploadError?.(error instanceof Error ? error.message : 'Error desconocido');
            setUploading(false);
        }
    }, [uploadEndpoint, onUploadProgress, onUploadComplete, onUploadError]);
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (disabled)
            return;
        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            if (multiple || selectedFiles.length === 0) {
                handleFileSelect(file);
            }
        });
    };
    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            if (multiple || selectedFiles.length === 0) {
                handleFileSelect(file);
            }
        });
    };
    const removeFile = (index) => {
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
    return (_jsxs("div", { className: `w-full ${className}`, children: [_jsxs("div", { className: `relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, onClick: openFileDialog, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: acceptedTypes.join(','), onChange: handleFileInputChange, className: "hidden", disabled: disabled, multiple: multiple }), selectedFiles.length > 0 ? (_jsxs("div", { className: "space-y-3", children: [selectedFiles.map((file, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(DocumentIcon, { className: "h-6 w-6 text-blue-500" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: file.name }), _jsxs("p", { className: "text-xs text-gray-500", children: [(file.size / 1024 / 1024).toFixed(2), " MB"] }), uploading && index === selectedFiles.length - 1 && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${uploadProgress}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [uploadProgress, "% subido"] })] })), uploadStatus === 'success' && index === selectedFiles.length - 1 && (_jsxs("div", { className: "flex items-center mt-1", children: [_jsx(CheckCircleIcon, { className: "h-4 w-4 text-green-500 mr-1" }), _jsx("span", { className: "text-xs text-green-600", children: "Subido exitosamente" })] })), uploadStatus === 'error' && index === selectedFiles.length - 1 && (_jsxs("div", { className: "flex items-center mt-1", children: [_jsx(ExclamationTriangleIcon, { className: "h-4 w-4 text-red-500 mr-1" }), _jsx("span", { className: "text-xs text-red-600", children: "Error en la subida" })] }))] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }, disabled: uploading, children: _jsx(XMarkIcon, { className: "h-4 w-4" }) })] }, `${file.name}-${index}`))), multiple && selectedFiles.length < maxFiles && (_jsx("div", { className: "text-center pt-2", children: _jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                        e.stopPropagation();
                                        openFileDialog();
                                    }, disabled: uploading, children: "Agregar m\u00E1s archivos" }) })), selectedFiles.length > 1 && (_jsx("div", { className: "text-center pt-2", children: _jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                        e.stopPropagation();
                                        removeAllFiles();
                                    }, disabled: uploading, children: "Limpiar todos" }) }))] })) : (_jsxs("div", { className: "text-center", children: [_jsx(CloudArrowUpIcon, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Arrastra y suelta tu archivo aqu\u00ED" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "o haz clic para seleccionar un archivo" }), _jsxs("p", { className: "text-xs text-gray-400 mt-2", children: ["Tipos permitidos: ", acceptedTypes.join(', '), " (m\u00E1x. ", maxSize, "MB)", multiple && ` • Máximo ${maxFiles} archivo(s)`] })] })] }))] }), error && (_jsx("div", { className: "mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2", children: error }))] }));
};
export default FileUpload;
