import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { apiClient } from '../../lib/api';
import Button from '../ui/Button';
const CustomVoiceModal = ({ isOpen, onClose, onSave }) => {
    const [voiceConfig, setVoiceConfig] = useState({
        type: "voice_eleven_labs",
        voice_id: "",
        model_id: "eleven_flash_v2_5",
        stability: 0.6,
        similarity_boost: 0.5
    });
    const [voiceName, setVoiceName] = useState("");
    const [jsonInput, setJsonInput] = useState("");
    const [isValidJson, setIsValidJson] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [previewError, setPreviewError] = useState(null);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);
    // Función para validar JSON
    const validateJson = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            // Validar que tenga los campos requeridos
            if (!parsed.type || !parsed.voice_id) {
                return false;
            }
            return true;
        }
        catch {
            return false;
        }
    };
    // Función para actualizar el JSON
    const handleJsonChange = (value) => {
        setJsonInput(value);
        const isValid = validateJson(value);
        setIsValidJson(isValid);
        if (isValid) {
            try {
                const parsed = JSON.parse(value);
                setVoiceConfig(parsed);
            }
            catch {
                // Ignorar errores de parseo
            }
        }
    };
    // Función para cargar JSON de ejemplo
    const loadExampleJson = () => {
        const example = {
            type: "voice_eleven_labs",
            voice_id: "EXAVITQu4vr4xnSDxMaL", // Voz Adam de ElevenLabs (válida)
            model_id: "eleven_flash_v2_5",
            stability: 0.6,
            similarity_boost: 0.5
        };
        const jsonString = JSON.stringify(example, null, 2);
        setJsonInput(jsonString);
        setVoiceConfig(example);
        setIsValidJson(true);
    };
    // Función para cargar voces disponibles
    const loadAvailableVoices = async () => {
        try {
            setIsLoadingVoices(true);
            setPreviewError(null);
            const response = await apiClient.get('/integrations/elevenlabs/voices');
            setAvailableVoices(response);
            console.log(`✅ Cargadas ${response.length} voces disponibles`);
        }
        catch (error) {
            console.error("Error cargando voces:", error);
            setPreviewError("Error cargando voces disponibles. Verifica tu configuración de ElevenLabs.");
        }
        finally {
            setIsLoadingVoices(false);
        }
    };
    // Función para seleccionar una voz disponible
    const selectVoice = (voice) => {
        const newConfig = {
            type: "voice_eleven_labs",
            voice_id: voice.id,
            model_id: "eleven_flash_v2_5",
            stability: 0.6,
            similarity_boost: 0.5
        };
        const jsonString = JSON.stringify(newConfig, null, 2);
        setJsonInput(jsonString);
        setVoiceConfig(newConfig);
        setIsValidJson(true);
        setPreviewError(null);
    };
    // Función para escuchar preview de la voz
    const handlePreview = async () => {
        if (!voiceConfig.voice_id) {
            alert("Por favor, ingresa un voice_id válido");
            return;
        }
        // Validar formato del voice_id (debe tener al menos 10 caracteres)
        if (voiceConfig.voice_id.length < 10) {
            setPreviewError("El voice_id parece ser demasiado corto. Por favor, verifica que sea correcto.");
            return;
        }
        try {
            setIsLoadingPreview(true);
            setPreviewError(null);
            // Detener audio anterior si existe
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            // Llamar al endpoint de preview
            const response = await apiClient.post('/integrations/elevenlabs/custom-voices/preview', {
                voice_id: voiceConfig.voice_id,
                text: "Hola, esta es una prueba de voz personalizada.",
                model_id: voiceConfig.model_id || "eleven_flash_v2_5",
                stability: voiceConfig.stability || 0.6,
                similarity_boost: voiceConfig.similarity_boost || 0.5,
            });
            if (response.audio_url) {
                // Crear elemento de audio
                const audio = new Audio(response.audio_url);
                audio.onended = () => {
                    setIsPlaying(false);
                };
                audio.onerror = () => {
                    setPreviewError("Error al reproducir el audio");
                    setIsPlaying(false);
                    setIsLoadingPreview(false);
                };
                setAudioElement(audio);
                await audio.play();
                setIsPlaying(true);
                setIsLoadingPreview(false);
            }
            else {
                setPreviewError("No se pudo generar el preview de la voz");
                setIsLoadingPreview(false);
            }
        }
        catch (error) {
            console.error("Error al reproducir preview:", error);
            // Manejar errores específicos de ElevenLabs
            let errorMessage = "Error al generar el preview";
            if (error.message) {
                if (error.message.includes("voice_not_found")) {
                    errorMessage = "El voice_id proporcionado no existe en ElevenLabs. Por favor, verifica que el ID sea correcto.";
                }
                else if (error.message.includes("404")) {
                    errorMessage = "El voice_id no fue encontrado. Asegúrate de usar un ID de voz válido.";
                }
                else if (error.message.includes("401") || error.message.includes("unauthorized")) {
                    errorMessage = "Error de autenticación con ElevenLabs. Verifica tu API key.";
                }
                else {
                    errorMessage = error.message;
                }
            }
            setPreviewError(errorMessage);
            setIsPlaying(false);
            setIsLoadingPreview(false);
        }
    };
    const handleStopPreview = () => {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            setIsPlaying(false);
        }
    };
    const handleSave = () => {
        if (!isValidJson) {
            alert("Por favor, ingresa un JSON válido");
            return;
        }
        if (!voiceName.trim()) {
            alert("Por favor, ingresa un nombre para la voz");
            return;
        }
        // Detener audio si está reproduciéndose
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        onSave(voiceConfig, voiceName);
        onClose();
        // Resetear formulario
        setVoiceConfig({
            type: "voice_eleven_labs",
            voice_id: "",
            model_id: "eleven_flash_v2_5",
            stability: 0.6,
            similarity_boost: 0.5
        });
        setVoiceName("");
        setJsonInput("");
        setIsValidJson(true);
        setPreviewError(null);
    };
    const handleCancel = () => {
        // Detener audio si está reproduciéndose
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        onClose();
        // Resetear formulario
        setVoiceConfig({
            type: "voice_eleven_labs",
            voice_id: "",
            model_id: "eleven_flash_v2_5",
            stability: 0.6,
            similarity_boost: 0.5
        });
        setVoiceName("");
        setJsonInput("");
        setIsValidJson(true);
        setPreviewError(null);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75", onClick: handleCancel }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-3xl w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Custom Voice" }), _jsx("button", { onClick: handleCancel, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nombre de la Voz *" }), _jsx("input", { type: "text", value: voiceName, onChange: (e) => setVoiceName(e.target.value), placeholder: "Ej: Voz Personalizada 1", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Configuraci\u00F3n de Voz (JSON) *" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: loadAvailableVoices, disabled: isLoadingVoices, className: "text-sm text-green-600 hover:text-green-800 disabled:text-gray-400", children: isLoadingVoices ? 'Cargando...' : 'Ver Voces Disponibles' }), _jsx("button", { onClick: loadExampleJson, className: "text-sm text-blue-600 hover:text-blue-800", children: "Cargar Ejemplo" })] })] }), _jsx("textarea", { value: jsonInput, onChange: (e) => handleJsonChange(e.target.value), rows: 12, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${!isValidJson && jsonInput ? 'border-red-500' : 'border-gray-300'}`, placeholder: '{"type": "voice_eleven_labs", "voice_id": "...", ...}' }), !isValidJson && jsonInput && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: "JSON inv\u00E1lido. Por favor verifica la sintaxis." }))] }), availableVoices.length > 0 && (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h4", { className: "text-sm font-medium text-gray-900 mb-3", children: ["Voces Disponibles (", availableVoices.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 gap-2 max-h-40 overflow-y-auto", children: availableVoices.slice(0, 10).map((voice, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 border border-gray-100 rounded hover:bg-gray-50", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: voice.name }), _jsxs("div", { className: "text-xs text-gray-500", children: ["ID: ", voice.id] }), voice.category && (_jsx("div", { className: "text-xs text-blue-600", children: voice.category }))] }), _jsx("button", { onClick: () => selectVoice(voice), className: "ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200", children: "Usar" })] }, voice.id))) }), availableVoices.length > 10 && (_jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Mostrando las primeras 10 voces de ", availableVoices.length, " disponibles"] }))] })), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-blue-900 mb-2", children: "Campos Requeridos:" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsxs("li", { children: [_jsx("strong", { children: "type:" }), " Tipo de voz (ej: \"voice_eleven_labs\")"] }), _jsxs("li", { children: [_jsx("strong", { children: "voice_id:" }), " ID de la voz en ElevenLabs"] }), _jsxs("li", { children: [_jsx("strong", { children: "model_id:" }), " (Opcional) Modelo a usar (ej: \"eleven_flash_v2_5\")"] }), _jsxs("li", { children: [_jsx("strong", { children: "stability:" }), " (Opcional) Estabilidad de la voz (0.0 - 1.0)"] }), _jsxs("li", { children: [_jsx("strong", { children: "similarity_boost:" }), " (Opcional) Boost de similitud (0.0 - 1.0)"] })] })] }), _jsxs("div", { className: "flex flex-col items-center justify-center gap-2", children: [_jsx("button", { onClick: isPlaying ? handleStopPreview : handlePreview, disabled: !isValidJson || !voiceConfig.voice_id || isLoadingPreview, className: `flex items-center gap-2 px-4 py-2 rounded-md transition-all ${!isValidJson || !voiceConfig.voice_id || isLoadingPreview
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : isPlaying
                                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                                            : 'bg-green-600 text-white hover:bg-green-700'}`, children: isLoadingPreview ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), _jsx("span", { children: "Generando..." })] })) : isPlaying ? (_jsxs(_Fragment, { children: [_jsx(StopIcon, { className: "h-5 w-5" }), _jsx("span", { children: "Detener" })] })) : (_jsxs(_Fragment, { children: [_jsx(PlayIcon, { className: "h-5 w-5" }), _jsx("span", { children: "Escuchar Preview" })] })) }), previewError && (_jsx("p", { className: "text-sm text-red-600 text-center", children: previewError }))] })] }), _jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { variant: "danger", onClick: handleCancel, children: "Cancelar" }), _jsx(Button, { variant: "primary", onClick: handleSave, disabled: !isValidJson || !voiceName.trim(), children: "Guardar" })] })] })] })] }) }));
};
export default CustomVoiceModal;
