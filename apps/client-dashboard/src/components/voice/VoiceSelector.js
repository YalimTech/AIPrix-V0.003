import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useResponsiveVoices } from "../../hooks/useResponsiveVoices";
const VoiceSelector = ({ voices, selectedVoiceId, onSelectVoice, onAddCustomVoice, isLoading = false, error = null, }) => {
    const voicesPerPage = useResponsiveVoices();
    const scrollVoices = (direction) => {
        if (voices.length === 0)
            return;
        const currentIndex = selectedVoiceId
            ? voices.findIndex((v) => v.id === selectedVoiceId)
            : 0;
        if (direction === "left") {
            const newIndex = Math.max(0, currentIndex - voicesPerPage);
            onSelectVoice(voices[newIndex].id);
        }
        else if (direction === "right") {
            const newIndex = Math.min(voices.length - 1, currentIndex + voicesPerPage);
            onSelectVoice(voices[newIndex].id);
        }
    };
    return (_jsxs("div", { className: "mb-8", style: { pointerEvents: 'auto' }, children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("h3", { className: "text-sm font-medium text-gray-700", children: "Curated Voices" }) }), _jsxs("div", { className: "relative", style: { pointerEvents: 'auto' }, children: [isLoading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })) : error ? (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-2", children: [_jsx("svg", { className: "w-6 h-6 text-red-500 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("h4", { className: "text-lg font-medium text-red-800", children: "ElevenLabs no est\u00E1 conectado" })] }), _jsx("p", { className: "text-red-600 mb-4", children: error instanceof Error ? error.message : String(error) }), _jsx("p", { className: "text-sm text-red-500 mb-4", children: "Las voces solo est\u00E1n disponibles cuando ElevenLabs est\u00E1 conectado correctamente." }), onAddCustomVoice && (_jsx("div", { className: "flex justify-center mt-4", children: _jsxs("button", { onClick: onAddCustomVoice, className: "flex flex-col items-center cursor-pointer transition-all hover:scale-110 active:scale-95", children: [_jsx("div", { className: "w-16 h-16 rounded-full mb-2 border-2 border-dashed border-blue-500 hover:border-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all bg-blue-50 shadow-sm hover:shadow-md", children: _jsx(PlusIcon, { className: "w-8 h-8 text-blue-600" }) }), _jsx("p", { className: "text-sm text-blue-600 font-semibold", children: "Agregar Custom Voice" })] }) }))] })) : voices.length === 0 ? (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-2", children: [_jsx("svg", { className: "w-6 h-6 text-yellow-500 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("h4", { className: "text-lg font-medium text-yellow-800", children: "No hay voces disponibles" })] }), _jsx("p", { className: "text-yellow-600 mb-4", children: "No se pudieron cargar las voces de ElevenLabs. Verifica la conexi\u00F3n." }), onAddCustomVoice && (_jsx("div", { className: "flex justify-center mt-4", children: _jsxs("button", { onClick: onAddCustomVoice, className: "flex flex-col items-center cursor-pointer transition-all hover:scale-110 active:scale-95", children: [_jsx("div", { className: "w-16 h-16 rounded-full mb-2 border-2 border-dashed border-blue-500 hover:border-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all bg-blue-50 shadow-sm hover:shadow-md", children: _jsx(PlusIcon, { className: "w-8 h-8 text-blue-600" }) }), _jsx("p", { className: "text-sm text-blue-600 font-semibold", children: "Agregar Custom Voice" })] }) }))] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => scrollVoices("left"), disabled: voices.length === 0 ||
                                    (selectedVoiceId
                                        ? voices.findIndex((v) => v.id === selectedVoiceId)
                                        : 0) < voicesPerPage, className: "absolute left-0 top-1/3 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed", style: { pointerEvents: 'auto' }, children: _jsx(ChevronLeftIcon, { className: "w-5 h-5 text-gray-600" }) }), _jsx("button", { onClick: () => scrollVoices("right"), disabled: voices.length === 0 ||
                                    (selectedVoiceId
                                        ? voices.findIndex((v) => v.id === selectedVoiceId)
                                        : 0) >= voices.length - voicesPerPage, className: "absolute right-0 top-1/3 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white", style: { pointerEvents: 'auto' }, children: _jsx(ChevronRightIcon, { className: "w-5 h-5 text-gray-600" }) }), _jsx("div", { className: "relative px-8", children: _jsx("div", { className: "overflow-x-auto py-6", style: { scrollbarWidth: 'thin' }, children: _jsxs("div", { className: "flex gap-3 transition-transform duration-300 ease-in-out", style: {
                                            transform: `translateX(-${Math.floor((selectedVoiceId ? voices.findIndex((v) => v.id === selectedVoiceId) : 0) / voicesPerPage) * 100}%)`,
                                            width: `${Math.ceil((voices.length + (onAddCustomVoice ? 1 : 0)) / voicesPerPage) * 100}%`,
                                        }, children: [voices.map((voice, index) => (_jsxs("div", { onClick: () => onSelectVoice(voice.id), className: `flex-shrink-0 flex flex-col items-center cursor-pointer transition-all relative z-10 ${selectedVoiceId === voice.id
                                                    ? "scale-110"
                                                    : "opacity-70 hover:opacity-100"}`, style: { width: `${100 / voicesPerPage}%`, pointerEvents: 'auto' }, children: [_jsx("div", { className: `w-16 h-16 rounded-full overflow-hidden mb-2 border-2 relative group ${selectedVoiceId === voice.id
                                                            ? "border-blue-500 ring-2 ring-blue-300"
                                                            : voice.isCustom
                                                                ? "border-green-500"
                                                                : "border-gray-200"}`, style: { pointerEvents: 'auto' }, children: _jsx("img", { src: voice.previewUrl ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(voice.name.charAt(0).toUpperCase())}&background=6366f1&color=fff&size=200&bold=true&format=png`, alt: voice.name, className: "w-full h-full object-cover pointer-events-none", onError: (e) => {
                                                                const target = e.target;
                                                                target.style.display = "none";
                                                                const fallback = document.createElement("div");
                                                                fallback.className =
                                                                    "w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl pointer-events-none";
                                                                fallback.textContent = voice.name
                                                                    .charAt(0)
                                                                    .toUpperCase();
                                                                target.parentNode?.appendChild(fallback);
                                                            } }) }), _jsx("p", { className: "text-xs text-gray-700 text-center leading-tight truncate w-full mb-1 pointer-events-none", children: voice.name }), voice.languageCapabilities?.supported && voice.languageCapabilities.supported.length > 0 && (_jsxs("p", { className: "text-xs text-blue-600 text-center leading-tight truncate w-full pointer-events-none", children: [voice.languageCapabilities.supported.length, " idioma", voice.languageCapabilities.supported.length > 1 ? 's' : ''] })), voice.isCustom && (_jsx("p", { className: "text-xs text-green-600 text-center leading-tight truncate w-full pointer-events-none", children: "Custom" }))] }, voice.id || `voice-${index}`))), onAddCustomVoice && (_jsxs("div", { onClick: () => {
                                                    console.log('🎤 Custom Voice button clicked!');
                                                    onAddCustomVoice();
                                                }, className: "flex-shrink-0 flex flex-col items-center cursor-pointer transition-all relative z-10 hover:scale-110 active:scale-95", style: { width: `${100 / voicesPerPage}%`, pointerEvents: 'auto', minWidth: '80px' }, children: [_jsx("div", { className: "w-16 h-16 rounded-full mb-2 border-2 border-dashed border-blue-500 hover:border-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all bg-blue-50 shadow-sm hover:shadow-md", style: { pointerEvents: 'auto' }, children: _jsx(PlusIcon, { className: "w-8 h-8 text-blue-600" }) }), _jsx("p", { className: "text-xs text-blue-600 font-semibold text-center leading-tight truncate w-full mb-1 pointer-events-none", children: "Custom Voice" })] }))] }) }) })] })), !isLoading && !error && voices.length > 0 && (_jsx("div", { className: "flex justify-center gap-1.5 mt-5", children: Array.from({
                            length: Math.ceil((voices.length + (onAddCustomVoice ? 1 : 0)) / voicesPerPage),
                        }).map((_, index) => {
                            const dotId = `pagination-dot-${index}`;
                            return (_jsx("div", { className: `w-1.5 h-1.5 rounded-full ${index ===
                                    Math.floor((selectedVoiceId
                                        ? voices.findIndex((v) => v.id === selectedVoiceId)
                                        : 0) / voicesPerPage)
                                    ? "bg-gray-800"
                                    : "bg-gray-300"}` }, dotId));
                        }) }))] })] }));
};
export default VoiceSelector;
