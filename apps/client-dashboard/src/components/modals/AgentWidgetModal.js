import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircleIcon, PhotoIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useUploadAgentAvatar } from "../../hooks/useElevenLabs";
const AgentWidgetModal = ({ isOpen, onClose, agentId, onAvatarUploaded, }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const uploadMutation = useUploadAgentAvatar();
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleUpload = async () => {
        if (!selectedFile)
            return;
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
        }
        catch (error) {
            console.error("Error al subir avatar:", error);
            alert("Error al subir el avatar. Por favor, inténtalo de nuevo.");
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50", onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Subir Avatar del Agente" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Seleccionar Imagen" }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleFileSelect, className: "hidden", id: "avatar-upload" }), _jsx("label", { htmlFor: "avatar-upload", className: "cursor-pointer", children: previewUrl ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: previewUrl, alt: "Preview", className: "max-w-full h-48 mx-auto rounded-lg object-cover" }), _jsxs("div", { className: "mt-4 flex items-center justify-center text-green-600", children: [_jsx(CheckCircleIcon, { className: "w-6 h-6 mr-2" }), _jsx("span", { className: "text-sm font-medium", children: "Imagen seleccionada" })] })] })) : (_jsxs("div", { children: [_jsx(PhotoIcon, { className: "w-12 h-12 text-gray-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-600", children: "Haz clic para seleccionar una imagen" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "PNG, JPG, GIF hasta 10MB" })] })) })] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: [_jsx("h3", { className: "text-sm font-semibold text-blue-900 mb-2", children: "Recomendaciones:" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 Tama\u00F1o recomendado: 512x512 p\u00EDxeles" }), _jsx("li", { children: "\u2022 Formato: PNG, JPG o GIF" }), _jsx("li", { children: "\u2022 El avatar aparecer\u00E1 en el widget del agente" }), _jsx("li", { children: "\u2022 Tama\u00F1o m\u00E1ximo: 10MB" })] })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", disabled: uploadMutation.isPending, children: "Cancelar" }), _jsx("button", { onClick: handleUpload, disabled: !selectedFile || uploadMutation.isPending, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: uploadMutation.isPending ? "Subiendo..." : "Subir Avatar" })] })] }) }));
};
export default AgentWidgetModal;
