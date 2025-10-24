import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useResponsiveVoices } from "../../hooks/useResponsiveVoices";

interface Voice {
  id: string;
  name: string;
  previewUrl?: string;
  languageCapabilities?: {
    supported: string[];
    multilingual?: boolean;
  };
  isCustom?: boolean;
}

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string | null;
  onSelectVoice: (voiceId: string) => void;
  onAddCustomVoice?: () => void;
  isLoading?: boolean;
  error?: Error | null;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onAddCustomVoice,
  isLoading = false,
  error = null,
}) => {
  const voicesPerPage = useResponsiveVoices();

  const scrollVoices = (direction: "left" | "right") => {
    if (voices.length === 0) return;

    const currentIndex = selectedVoiceId 
      ? voices.findIndex((v) => v.id === selectedVoiceId)
      : 0;

    if (direction === "left") {
      const newIndex = Math.max(0, currentIndex - voicesPerPage);
      onSelectVoice(voices[newIndex].id);
    } else if (direction === "right") {
      const newIndex = Math.min(
        voices.length - 1,
        currentIndex + voicesPerPage,
      );
      onSelectVoice(voices[newIndex].id);
    }
  };

  return (
    <div className="mb-8" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          Curated Voices
        </h3>
      </div>
      <div className="relative" style={{ pointerEvents: 'auto' }}>
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-medium text-red-800">ElevenLabs no está conectado</h4>
            </div>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : String(error)}
            </p>
            <p className="text-sm text-red-500 mb-4">
              Las voces solo están disponibles cuando ElevenLabs está conectado correctamente.
            </p>
            {/* Botón para agregar Custom Voice incluso con error */}
            {onAddCustomVoice && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={onAddCustomVoice}
                  className="flex flex-col items-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                >
                  <div className="w-16 h-16 rounded-full mb-2 border-2 border-dashed border-blue-500 hover:border-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all bg-blue-50 shadow-sm hover:shadow-md">
                    <PlusIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-600 font-semibold">
                    Agregar Custom Voice
                  </p>
                </button>
              </div>
            )}
          </div>
        ) : voices.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-medium text-yellow-800">No hay voces disponibles</h4>
            </div>
            <p className="text-yellow-600 mb-4">
              No se pudieron cargar las voces de ElevenLabs. Verifica la conexión.
            </p>
            {/* Botón para agregar Custom Voice incluso sin voces */}
            {onAddCustomVoice && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={onAddCustomVoice}
                  className="flex flex-col items-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                >
                  <div className="w-16 h-16 rounded-full mb-2 border-2 border-dashed border-blue-500 hover:border-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all bg-blue-50 shadow-sm hover:shadow-md">
                    <PlusIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-600 font-semibold">
                    Agregar Custom Voice
                  </p>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Left Arrow */}
            <button
              onClick={() => scrollVoices("left")}
              disabled={
                voices.length === 0 ||
                (selectedVoiceId 
                  ? voices.findIndex((v) => v.id === selectedVoiceId)
                  : 0) < voicesPerPage
              }
              className="absolute left-0 top-1/3 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollVoices("right")}
              disabled={
                voices.length === 0 ||
                (selectedVoiceId 
                  ? voices.findIndex((v) => v.id === selectedVoiceId)
                  : 0) >= voices.length - voicesPerPage
              }
              className="absolute right-0 top-1/3 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Voices Container - Carrusel de lado a lado */}
            <div className="relative px-8">
              <div className="overflow-x-auto py-6" style={{ scrollbarWidth: 'thin' }}>
                <div
                  className="flex gap-3 transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${Math.floor((selectedVoiceId ? voices.findIndex((v) => v.id === selectedVoiceId) : 0) / voicesPerPage) * 100}%)`,
                    width: `${Math.ceil((voices.length + (onAddCustomVoice ? 1 : 0)) / voicesPerPage) * 100}%`,
                  }}
                >
                  {voices.map((voice, index) => (
                    <div
                      key={voice.id || `voice-${index}`}
                      onClick={() => onSelectVoice(voice.id)}
                      className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all relative z-10 ${
                        selectedVoiceId === voice.id
                          ? "scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      style={{ width: `${100 / voicesPerPage}%`, pointerEvents: 'auto' }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full overflow-hidden mb-2 border-2 relative group ${
                          selectedVoiceId === voice.id
                            ? "border-blue-500 ring-2 ring-blue-300"
                            : voice.isCustom
                            ? "border-green-500"
                            : "border-gray-200"
                        }`}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <img
                          src={
                            voice.previewUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(voice.name.charAt(0).toUpperCase())}&background=6366f1&color=fff&size=200&bold=true&format=png`
                          }
                          alt={voice.name}
                          className="w-full h-full object-cover pointer-events-none"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl pointer-events-none";
                            fallback.textContent = voice.name
                              .charAt(0)
                              .toUpperCase();
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-700 text-center leading-tight truncate w-full mb-1 pointer-events-none">
                        {voice.name}
                      </p>
                      {voice.languageCapabilities?.supported && voice.languageCapabilities.supported.length > 0 && (
                        <p className="text-xs text-blue-600 text-center leading-tight truncate w-full pointer-events-none">
                          {voice.languageCapabilities.supported.length} idioma{voice.languageCapabilities.supported.length > 1 ? 's' : ''}
                        </p>
                      )}
                      {voice.isCustom && (
                        <p className="text-xs text-green-600 text-center leading-tight truncate w-full pointer-events-none">
                          Custom
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {/* Botón para agregar Custom Voice - SIEMPRE VISIBLE */}
                  {onAddCustomVoice && (
                    <div
                      onClick={() => {
                        console.log('🎤 Custom Voice button clicked!');
                        onAddCustomVoice();
                      }}
                      className="flex-shrink-0 flex flex-col items-center cursor-pointer transition-all relative z-10 hover:scale-110 active:scale-95"
                      style={{ width: `${100 / voicesPerPage}%`, pointerEvents: 'auto', minWidth: '80px' }}
                    >
                      <div
                        className="w-16 h-16 rounded-full mb-2 border-2 border-dashed border-blue-500 hover:border-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all bg-blue-50 shadow-sm hover:shadow-md"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <PlusIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-xs text-blue-600 font-semibold text-center leading-tight truncate w-full mb-1 pointer-events-none">
                        Custom Voice
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pagination Dots - Centrados con el carrusel */}
        {!isLoading && !error && voices.length > 0 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {Array.from({
              length: Math.ceil((voices.length + (onAddCustomVoice ? 1 : 0)) / voicesPerPage),
            }).map((_, index) => {
              const dotId = `pagination-dot-${index}`;
              return (
                <div
                  key={dotId}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index ===
                    Math.floor(
                      (selectedVoiceId
                        ? voices.findIndex(
                            (v) => v.id === selectedVoiceId,
                          )
                        : 0) / voicesPerPage,
                    )
                      ? "bg-gray-800"
                      : "bg-gray-300"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSelector;

