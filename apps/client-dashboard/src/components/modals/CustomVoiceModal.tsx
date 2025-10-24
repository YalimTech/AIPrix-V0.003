import { PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { apiClient } from '../../lib/api';
import Button from '../ui/Button';

interface CustomVoiceConfig {
  type: string;
  voice_id: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  [key: string]: any;
}

interface CustomVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CustomVoiceConfig, name: string) => void;
}

const CustomVoiceModal: React.FC<CustomVoiceModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [voiceConfig, setVoiceConfig] = useState<CustomVoiceConfig>({
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
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Función para validar JSON
  const validateJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      // Validar que tenga los campos requeridos
      if (!parsed.type || !parsed.voice_id) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Función para actualizar el JSON
  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    const isValid = validateJson(value);
    setIsValidJson(isValid);
    
    if (isValid) {
      try {
        const parsed = JSON.parse(value);
        setVoiceConfig(parsed);
      } catch {
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
      
      const response = await apiClient.get<any[]>('/integrations/elevenlabs/voices');
      setAvailableVoices(response);
      
      console.log(`✅ Cargadas ${response.length} voces disponibles`);
    } catch (error: any) {
      console.error("Error cargando voces:", error);
      setPreviewError("Error cargando voces disponibles. Verifica tu configuración de ElevenLabs.");
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // Función para seleccionar una voz disponible
  const selectVoice = (voice: any) => {
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
      const response = await apiClient.post<{ audio_url: string }>('/integrations/elevenlabs/custom-voices/preview', {
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
      } else {
        setPreviewError("No se pudo generar el preview de la voz");
        setIsLoadingPreview(false);
      }
    } catch (error: any) {
      console.error("Error al reproducir preview:", error);
      
      // Manejar errores específicos de ElevenLabs
      let errorMessage = "Error al generar el preview";
      
      if (error.message) {
        if (error.message.includes("voice_not_found")) {
          errorMessage = "El voice_id proporcionado no existe en ElevenLabs. Por favor, verifica que el ID sea correcto.";
        } else if (error.message.includes("404")) {
          errorMessage = "El voice_id no fue encontrado. Asegúrate de usar un ID de voz válido.";
        } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
          errorMessage = "Error de autenticación con ElevenLabs. Verifica tu API key.";
        } else {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCancel} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Custom Voice</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Nombre de la voz */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Voz *
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="Ej: Voz Personalizada 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* JSON Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Configuración de Voz (JSON) *
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={loadAvailableVoices}
                      disabled={isLoadingVoices}
                      className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
                    >
                      {isLoadingVoices ? 'Cargando...' : 'Ver Voces Disponibles'}
                    </button>
                    <button
                      onClick={loadExampleJson}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Cargar Ejemplo
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={12}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                    !isValidJson && jsonInput ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='{"type": "voice_eleven_labs", "voice_id": "...", ...}'
                />
                
                {!isValidJson && jsonInput && (
                  <p className="mt-1 text-sm text-red-600">
                    JSON inválido. Por favor verifica la sintaxis.
                  </p>
                )}
              </div>

              {/* Voces disponibles */}
              {availableVoices.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Voces Disponibles ({availableVoices.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {availableVoices.slice(0, 10).map((voice, index) => (
                      <div
                        key={voice.id}
                        className="flex items-center justify-between p-2 border border-gray-100 rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{voice.name}</div>
                          <div className="text-xs text-gray-500">ID: {voice.id}</div>
                          {voice.category && (
                            <div className="text-xs text-blue-600">{voice.category}</div>
                          )}
                        </div>
                        <button
                          onClick={() => selectVoice(voice)}
                          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Usar
                        </button>
                      </div>
                    ))}
                  </div>
                  {availableVoices.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Mostrando las primeras 10 voces de {availableVoices.length} disponibles
                    </p>
                  )}
                </div>
              )}

              {/* Información de ayuda */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Campos Requeridos:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>type:</strong> Tipo de voz (ej: "voice_eleven_labs")</li>
                  <li><strong>voice_id:</strong> ID de la voz en ElevenLabs</li>
                  <li><strong>model_id:</strong> (Opcional) Modelo a usar (ej: "eleven_flash_v2_5")</li>
                  <li><strong>stability:</strong> (Opcional) Estabilidad de la voz (0.0 - 1.0)</li>
                  <li><strong>similarity_boost:</strong> (Opcional) Boost de similitud (0.0 - 1.0)</li>
                </ul>
              </div>

              {/* Preview Button */}
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  onClick={isPlaying ? handleStopPreview : handlePreview}
                  disabled={!isValidJson || !voiceConfig.voice_id || isLoadingPreview}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    !isValidJson || !voiceConfig.voice_id || isLoadingPreview
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isLoadingPreview ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generando...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <StopIcon className="h-5 w-5" />
                      <span>Detener</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5" />
                      <span>Escuchar Preview</span>
                    </>
                  )}
                </button>
                
                {previewError && (
                  <p className="text-sm text-red-600 text-center">
                    {previewError}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="danger"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isValidJson || !voiceName.trim()}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVoiceModal;

