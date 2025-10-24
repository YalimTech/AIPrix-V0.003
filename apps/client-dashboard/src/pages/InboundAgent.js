import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarIcon, CheckIcon, ClipboardDocumentIcon, Cog6ToothIcon, DocumentDuplicateIcon, HomeIcon, LinkIcon, PhoneArrowUpRightIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CalendarBookingModal from "../components/modals/CalendarBookingModal";
import CallTransferModal from "../components/modals/CallTransferModal";
import CustomVoiceModal from "../components/modals/CustomVoiceModal";
import WebhookConfigModal from "../components/modals/WebhookConfigModal";
import InfoTooltip from "../components/ui/InfoTooltip";
import StyledAudioPlayer from "../components/ui/StyledAudioPlayer";
import VoiceSelector from "../components/voice/VoiceSelector";
import { useAgents, useCreateAgent, useUpdateAgent } from "../hooks/useAgents";
import { useCreateCustomVoice, useCustomVoices } from "../hooks/useCustomVoices";
import { useElevenLabsVoices, useGetAgentSignedUrl } from "../hooks/useElevenLabs";
import { useVoicePreview } from "../hooks/useVoicePreview";
import { useAppStore } from "../store/appStore";
const PROMPT_PLACEHOLDER = `Instruct the AI on its purpose and what to do during the call (like this:
"Scenario: You are an AI conversational specialist named Tom working for "Sunshine Realty," a well-established real estate company specializing in residential properties. Your role is to assist potential clients by providing information about available properties, answering questions, and facilitating property viewings. The company's portfolio includes properties ranging from luxury apartments to affordable family homes in various locations.

Instructions:
Greet the Caller: Start each conversation with a friendly and professional greeting. For inbound calls, ask how you can assist them. For outbound calls, briefly introduce the purpose of the call.
Identify Client Needs: Ask questions to understand the client's specific requirements, such as the type of property they are interested in, preferred location, budget, and any must-have features.
Provide Property Information: Based on the client's needs, provide details about suitable properties. This can include the address, number of bedrooms and bathrooms, square footage, special features, and nearby amenities. For example, "I have a three-bedroom townhouse located at 456 Oak Lane, featuring a modern kitchen and a spacious backyard, priced at $350,000."
Answer Questions: Respond to any questions the client may have about the properties or the buying/selling process. Be informative and accurate.
Schedule Viewings: If the client is interested, offer to schedule a property viewing."`;
const InboundAgent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editAgentId = searchParams.get("edit");
    const [agentName, setAgentName] = useState("");
    const [language, setLanguage] = useState("All");
    const [openingMessage, setOpeningMessage] = useState("");
    const [selectedVoiceId, setSelectedVoiceId] = useState(null);
    const [aiCreativity, setAiCreativity] = useState(0.7);
    const [interruptSensitivity, setInterruptSensitivity] = useState(false);
    const [responseSpeed, setResponseSpeed] = useState(true);
    // Hook para el preview dinámico de voz
    const { playPreview, pause, seek, isPlaying: isPreviewPlaying, isLoading: isPreviewLoading, duration, currentTime, currentVoiceId: playingVoiceId, volume, handleVolumeChange, } = useVoicePreview();
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showCallTransferModal, setShowCallTransferModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [showSignedUrlModal, setShowSignedUrlModal] = useState(false);
    const [showCustomVoiceModal, setShowCustomVoiceModal] = useState(false);
    const [signedUrl, setSignedUrl] = useState("");
    const [agentIdForSignedUrl, setAgentIdForSignedUrl] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [callTransferConfig, setCallTransferConfig] = useState({
        type: "prompt",
        phoneNumber: "",
        keywords: [],
        businessHours: false,
    });
    const [calendarBookingConfig, setCalendarBookingConfig] = useState({
        enabled: false,
        provider: "GHL",
        calendarId: "",
        timezone: "",
    });
    // Hooks para backend
    const { data: elevenLabsVoices = [], isLoading: voicesLoading, error: voicesError } = useElevenLabsVoices(language === "All" ? undefined : language.toLowerCase());
    const { data: customVoices = [] } = useCustomVoices();
    const createCustomVoiceMutation = useCreateCustomVoice();
    const { data: agents = [] } = useAgents();
    const createAgentMutation = useCreateAgent();
    const handlePlayPreview = (voiceId) => {
        playPreview(voiceId, language);
    };
    const updateAgentMutation = useUpdateAgent();
    const addNotification = useAppStore((state) => state.addNotification);
    // Combinar voces de ElevenLabs con custom voices
    const allVoices = React.useMemo(() => {
        const elevenLabsVoicesList = elevenLabsVoices.map(v => ({
            id: v.id,
            name: v.name,
            previewUrl: v.previewUrl,
            languageCapabilities: v.languageCapabilities,
            isCustom: false,
        }));
        const customVoicesList = customVoices.map(v => ({
            id: `custom_${v.id}`,
            name: v.name,
            previewUrl: undefined,
            languageCapabilities: undefined,
            isCustom: true,
            config: v.config,
        }));
        return [...elevenLabsVoicesList, ...customVoicesList];
    }, [elevenLabsVoices, customVoices]);
    // Handler para agregar custom voice
    const handleAddCustomVoice = () => {
        setShowCustomVoiceModal(true);
    };
    // Handler para guardar custom voice
    const handleSaveCustomVoice = async (config, name) => {
        try {
            await createCustomVoiceMutation.mutateAsync({
                name,
                config,
            });
            addNotification({
                type: "success",
                title: "Custom Voice Creada",
                message: "La voz personalizada se ha creado exitosamente",
            });
            setShowCustomVoiceModal(false);
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error",
                message: error.message || "No se pudo crear la voz personalizada",
            });
        }
    };
    // Hook para obtener URL firmada
    const getSignedUrlMutation = useGetAgentSignedUrl();
    const agentToEdit = React.useMemo(() => {
        return agents.find((a) => a.id === editAgentId);
    }, [agents, editAgentId]);
    // Cargar datos del agente si estamos editando
    useEffect(() => {
        if (agentToEdit) {
            setAgentName(agentToEdit.name);
            setOpeningMessage(agentToEdit.description || "");
            setPrompt(agentToEdit.preMadePrompt || "");
            if (elevenLabsVoices.length > 0) {
                const voice = elevenLabsVoices.find((v) => v.id === agentToEdit.voiceName);
                if (voice) {
                    setSelectedVoiceId(voice.id);
                }
                else {
                    // Si no se encuentra en elevenLabsVoices, buscar en allVoices (incluye custom voices)
                    const allVoice = allVoices.find((v) => v.id === agentToEdit.voiceName);
                    if (allVoice) {
                        setSelectedVoiceId(allVoice.id);
                    }
                }
            }
            // Cargar todas las demás configuraciones
            setAiCreativity(agentToEdit.temperature || 0.7);
            setInterruptSensitivity(agentToEdit.interruptSensitivity || false);
            setResponseSpeed(agentToEdit.responseSpeed || true);
            setWebhookUrl(agentToEdit.webhookUrl || "");
            setCallTransferConfig({
                type: agentToEdit.callTransferType || "prompt",
                phoneNumber: agentToEdit.callTransferPhoneNumber || "",
                keywords: agentToEdit.callTransferKeywords || [],
                businessHours: agentToEdit.callTransferBusinessHours || false,
            });
            // Cargar configuración de calendario existente
            if (agentToEdit.calendarBookingEnabled) {
                setCalendarBookingConfig({
                    enabled: agentToEdit.calendarBookingEnabled,
                    provider: agentToEdit.calendarBookingProvider || "GHL",
                    calendarId: agentToEdit.calendarBookingId || "",
                    timezone: agentToEdit.calendarBookingTimezone || "",
                });
            }
        }
    }, [agentToEdit, elevenLabsVoices]);
    // Seleccionar la primera voz por defecto (solo si no estamos editando)
    useEffect(() => {
        if (!editAgentId && elevenLabsVoices.length > 0 && !selectedVoiceId) {
            setSelectedVoiceId(elevenLabsVoices[0].id);
        }
    }, [elevenLabsVoices, selectedVoiceId, editAgentId]);
    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        addNotification({
            type: "success",
            title: "Prompt Copiado",
            message: "El prompt se ha copiado al portapapeles",
        });
    };
    const handleSaveAgent = async () => {
        // Verificar autenticación primero
        const token = localStorage.getItem("auth_token");
        const accountId = localStorage.getItem("accountId");
        if (!token || !accountId) {
            addNotification({
                type: "error",
                title: "Error de Autenticación",
                message: "Debes iniciar sesión para crear agentes. Redirigiendo al login...",
            });
            // Redirigir al login después de un breve delay
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
            return;
        }
        if (!agentName.trim()) {
            addNotification({
                type: "error",
                title: "Error de Validación",
                message: "El nombre del agente es requerido",
            });
            return;
        }
        if (!selectedVoiceId) {
            addNotification({
                type: "error",
                title: "Error de Validación",
                message: "Debes seleccionar una voz",
            });
            return;
        }
        const selectedVoice = allVoices.find((v) => v.id === selectedVoiceId);
        if (!selectedVoice) {
            addNotification({
                type: "error",
                title: "Error",
                message: "Voz no encontrada",
            });
            return;
        }
        try {
            console.log("🔐 Guardando agente con autenticación...");
            console.log("Token presente:", !!token);
            console.log("Account ID presente:", !!accountId);
            console.log("🎤 Voz seleccionada para guardar:", selectedVoiceId);
            const agentData = {
                name: agentName,
                description: openingMessage,
                openingMessage: openingMessage,
                type: "inbound",
                voiceName: selectedVoiceId, // ENVIAR EL ID, NO EL NOMBRE
                preMadePrompt: prompt,
                maxTokens: 4000, // Corregido: máximo permitido por el backend
                temperature: aiCreativity,
                status: "active",
                // Configuraciones adicionales para ElevenLabs
                interruptSensitivity: interruptSensitivity,
                responseSpeed: responseSpeed,
                webhookUrl: webhookUrl,
                callTransferType: callTransferConfig.type,
                callTransferPhoneNumber: callTransferConfig.phoneNumber,
                callTransferKeywords: callTransferConfig.keywords,
                callTransferBusinessHours: callTransferConfig.businessHours,
                calendarBookingEnabled: calendarBookingConfig.enabled,
                calendarBookingProvider: calendarBookingConfig.provider,
                calendarBookingId: calendarBookingConfig.calendarId,
                calendarBookingTimezone: calendarBookingConfig.timezone,
            };
            console.log("📝 Datos del agente:", agentData);
            if (editAgentId) {
                await updateAgentMutation.mutateAsync({
                    id: editAgentId,
                    ...agentData,
                });
                addNotification({
                    type: "success",
                    title: "Agente Actualizado",
                    message: "El agente se ha actualizado exitosamente",
                });
                navigate("/saved-agents");
            }
            else {
                const newAgent = await createAgentMutation.mutateAsync(agentData);
                addNotification({
                    type: "success",
                    title: "Agente Creado",
                    message: "El agente se ha creado exitosamente",
                });
                // Obtener la URL firmada para el nuevo agente
                try {
                    console.log("🔗 Obteniendo URL firmada para el nuevo agente...");
                    const signedUrlResponse = await getSignedUrlMutation.mutateAsync({
                        agentId: newAgent.agentId || newAgent.id,
                        includeConversationId: false,
                    });
                    if (signedUrlResponse.signed_url) {
                        setSignedUrl(signedUrlResponse.signed_url);
                        setAgentIdForSignedUrl(newAgent.agentId || newAgent.id);
                        setShowSignedUrlModal(true);
                        console.log("✅ URL firmada obtenida exitosamente");
                    }
                }
                catch (error) {
                    console.error("❌ Error obteniendo URL firmada:", error);
                    // No bloquear el flujo si falla obtener la URL
                    navigate("/saved-agents");
                }
            }
        }
        catch (error) {
            console.error("❌ Error al guardar agente:", error);
            // Manejar errores específicos de autenticación
            if (error?.status === 401) {
                addNotification({
                    type: "error",
                    title: "Sesión Expirada",
                    message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                });
                // Limpiar tokens y redirigir
                localStorage.removeItem("auth_token");
                localStorage.removeItem("accountId");
                localStorage.removeItem("user_data");
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            }
            else {
                addNotification({
                    type: "error",
                    title: editAgentId ? "Error al Actualizar" : "Error al Crear",
                    message: error?.message || "No se pudo guardar el agente",
                });
            }
        }
    };
    const selectedVoice = allVoices.find(v => v.id === selectedVoiceId);
    // Función para convertir nombres de idiomas a abreviaturas
    const getLanguageAbbreviations = (languages) => {
        const languageMap = {
            'english': 'En',
            'spanish': 'Es',
            'french': 'Fr',
            'german': 'De',
            'italian': 'It',
            'portuguese': 'Pt',
            'polish': 'Pl',
            'turkish': 'Tr',
            'russian': 'Ru',
            'dutch': 'Nl',
            'czech': 'Cs',
            'arabic': 'Ar',
            'chinese': 'Zh',
            'japanese': 'Ja',
            'hungarian': 'Hu',
            'korean': 'Ko',
            'hindi': 'Hi',
            'norwegian': 'No',
            'finnish': 'Fi',
            'romanian': 'Ro',
            'indonesian': 'Id',
            'hebrew': 'He',
            'ukrainian': 'Uk',
            'greek': 'El',
            'malay': 'Ms',
            'slovak': 'Sk',
            'croatian': 'Hr',
            'bulgarian': 'Bg',
            'catalan': 'Ca',
            'urdu': 'Ur',
            'danish': 'Da',
            'swedish': 'Sv',
            'tamil': 'Ta',
            'thai': 'Th',
            'vietnamese': 'Vi',
        };
        return languages
            .map(lang => languageMap[lang.toLowerCase()] || lang.substring(0, 2).toUpperCase())
            .join(', ');
    };
    // Construir la descripción con todos los idiomas soportados
    const voiceDescription = selectedVoice
        ? (() => {
            console.log("🎤 InboundAgent - Voz seleccionada:", selectedVoice);
            if ('isCustom' in selectedVoice && selectedVoice.isCustom) {
                console.log("🎤 InboundAgent - Es una custom voice");
                return 'Custom Voice';
            }
            if ('labels' in selectedVoice && selectedVoice.labels) {
                const labels = selectedVoice.labels;
                console.log("🎤 InboundAgent - Labels de la voz:", labels);
                const baseInfo = [
                    labels.accent,
                    labels.descriptive,
                    labels.age,
                    labels.gender
                ].filter(Boolean).join(', ');
                // Agregar todos los idiomas soportados como abreviaturas
                const supportedLanguages = selectedVoice.languageCapabilities?.supported || [];
                const languageAbbrevs = supportedLanguages.length > 0
                    ? getLanguageAbbreviations(supportedLanguages)
                    : labels.language;
                const description = [baseInfo, languageAbbrevs].filter(Boolean).join(', ');
                console.log("🎤 InboundAgent - Descripción calculada:", description);
                return description;
            }
            console.log("🎤 InboundAgent - No hay labels disponibles");
            return undefined;
        })()
        : undefined;
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-end py-4 px-6 text-sm text-gray-500", children: [_jsx(HomeIcon, { className: "w-4 h-4" }), _jsx("span", { className: "mx-2", children: ">" }), _jsx("span", { className: "text-gray-900 font-medium", children: "Voice Agent" })] }), _jsxs("div", { className: "w-full px-6 pb-12", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-1", children: "Voice Agent" }), _jsx("h2", { className: "text-lg text-gray-600", children: editAgentId ? "Edit Inbound Agent" : "Create Inbound Agent" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Agent Name *" }), _jsx(InfoTooltip, { content: "A unique name for your agent that will help you identify it later.", className: "ml-1" })] }), _jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Required" }), _jsx("input", { type: "text", placeholder: "Agent Name", value: agentName, onChange: (e) => setAgentName(e.target.value), className: "w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Change Language" }), _jsx(InfoTooltip, { content: "This setting informs the AI of the language the user will be speaking.", className: "ml-1" })] }), _jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Languages" }), _jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm", children: [_jsx("option", { value: "All", children: "All Languages" }), _jsx("option", { value: "Multilingual", children: "Multilingual (English, Spanish, French, German, Hindi, Russian, Portuguese, Japanese, Italian, Dutch)" }), _jsx("option", { value: "English", children: "English" }), _jsx("option", { value: "Spanish", children: "Spanish" }), _jsx("option", { value: "French", children: "French" }), _jsx("option", { value: "German", children: "German" }), _jsx("option", { value: "Hindi", children: "Hindi" }), _jsx("option", { value: "Russian", children: "Russian" }), _jsx("option", { value: "Portuguese", children: "Portuguese" }), _jsx("option", { value: "Japanese", children: "Japanese" }), _jsx("option", { value: "Italian", children: "Italian" }), _jsx("option", { value: "Dutch", children: "Dutch" }), _jsx("option", { value: "Indonesian", children: "Indonesian" }), _jsx("option", { value: "Korean", children: "Korean" }), _jsx("option", { value: "Bulgarian", children: "Bulgarian" }), _jsx("option", { value: "Catalan", children: "Catalan" }), _jsx("option", { value: "Chinese (Mandarin)", children: "Chinese (Mandarin)" }), _jsx("option", { value: "Chinese (Cantonese)", children: "Chinese (Cantonese)" }), _jsx("option", { value: "Czech", children: "Czech" }), _jsx("option", { value: "Danish", children: "Danish" }), _jsx("option", { value: "Estonian", children: "Estonian" }), _jsx("option", { value: "Finnish", children: "Finnish" }), _jsx("option", { value: "Flemish", children: "Flemish" }), _jsx("option", { value: "French (Canada)", children: "French (Canada)" }), _jsx("option", { value: "German (Switzerland)", children: "German (Switzerland)" }), _jsx("option", { value: "Greek", children: "Greek" }), _jsx("option", { value: "Hungarian", children: "Hungarian" }), _jsx("option", { value: "Latvian", children: "Latvian" }), _jsx("option", { value: "Lithuanian", children: "Lithuanian" }), _jsx("option", { value: "Malay", children: "Malay" }), _jsx("option", { value: "Norwegian", children: "Norwegian" }), _jsx("option", { value: "Polish", children: "Polish" }), _jsx("option", { value: "Romanian", children: "Romanian" }), _jsx("option", { value: "Slovak", children: "Slovak" }), _jsx("option", { value: "Swedish", children: "Swedish" }), _jsx("option", { value: "Thai", children: "Thai" }), _jsx("option", { value: "Turkish", children: "Turkish" }), _jsx("option", { value: "Ukrainian", children: "Ukrainian" }), _jsx("option", { value: "Vietnamese", children: "Vietnamese" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Opening Message" }), _jsx(InfoTooltip, { content: "The first message the AI will say when the call starts. For example: 'Hey, this Alex, who am I speaking with?'", className: "ml-1" })] }), _jsx("p", { className: "text-xs text-gray-500 mb-2 invisible", children: "Placeholder" }), " ", _jsx("input", { type: "text", placeholder: "Opening Message", value: openingMessage, onChange: (e) => setOpeningMessage(e.target.value), className: "w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" })] })] }), _jsx(VoiceSelector, { voices: allVoices, selectedVoiceId: selectedVoiceId, onSelectVoice: (voiceId) => {
                            console.log("🎤 Voz seleccionada:", voiceId);
                            setSelectedVoiceId(voiceId);
                        }, onAddCustomVoice: handleAddCustomVoice, isLoading: voicesLoading, error: voicesError }), _jsx("div", { className: "max-w-4xl mx-auto mb-8", children: _jsx(StyledAudioPlayer, { isPlaying: isPreviewPlaying, isLoading: isPreviewLoading, currentTime: currentTime, duration: duration, volume: volume, voiceName: selectedVoice?.name, voiceDescription: voiceDescription, onPlayPause: () => {
                                if (playingVoiceId) {
                                    // Si hay una voz reproduciéndose, toggle play/pause
                                    if (isPreviewPlaying) {
                                        pause();
                                    }
                                    else {
                                        handlePlayPreview(playingVoiceId);
                                    }
                                }
                                else if (selectedVoiceId) {
                                    // Si no hay ninguna reproduciéndose, empieza la seleccionada
                                    handlePlayPreview(selectedVoiceId);
                                }
                            }, onSeek: seek, onVolumeChange: handleVolumeChange }) }), _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs("div", { className: "grid grid-cols-3 gap-8 mb-10", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-3", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Calendar Booking" }), _jsx(InfoTooltip, { content: "We organize and display your calendar availability into distinct time slots for scheduling appointments. Here is an example of the available slots for booking: Friday: From 10:00 A.M. to 11:00 A.M. and from 11:15 A.M. to 12:00 P.M. These time slots represent the periods during which appointments can be scheduled", className: "ml-1" })] }), _jsx("button", { onClick: () => setShowCalendarModal(true), className: "w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:bg-blue-100 transition-colors", children: _jsx(CalendarIcon, { className: "w-9 h-9 text-blue-500" }) })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-3", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Call Transfer" }), _jsx(InfoTooltip, { content: "If certain conditions are met during the call, this action allows the system to transfer the call to another specified phone number", className: "ml-1" })] }), _jsx("button", { onClick: () => setShowCallTransferModal(true), className: "w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:bg-blue-100 transition-colors", children: _jsx(PhoneArrowUpRightIcon, { className: "w-9 h-9 text-blue-500" }) })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-3", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Advanced Options" }), _jsx(InfoTooltip, { content: "Additional Configurations", className: "ml-1" })] }), _jsx("button", { onClick: () => setShowWebhookModal(true), className: "w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:bg-blue-100 transition-colors", children: _jsx(Cog6ToothIcon, { className: "w-9 h-9 text-blue-500" }) })] })] }) }), _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs("div", { className: "grid grid-cols-3 gap-12 mb-10", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Interrupt Sensitivity" }), _jsx(InfoTooltip, { content: "Determines how sensitive the system is to interruptions.", className: "ml-1" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Low" }), _jsx("button", { onClick: () => setInterruptSensitivity(!interruptSensitivity), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${interruptSensitivity ? "bg-blue-500" : "bg-gray-300"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${interruptSensitivity ? "translate-x-6" : "translate-x-0.5"}` }) }), _jsx("span", { className: "text-sm text-gray-600", children: "High" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Response Speed" }), _jsx(InfoTooltip, { content: "Controls how the bot determines when the human is done speaking so it can kick off its response.", className: "ml-1" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Auto" }), _jsx("button", { onClick: () => setResponseSpeed(!responseSpeed), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${responseSpeed ? "bg-blue-500" : "bg-gray-300"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${responseSpeed ? "translate-x-6" : "translate-x-0.5"}` }) }), _jsx("span", { className: "text-sm text-gray-600", children: "Sensitive" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "AI Creativity" }), _jsx(InfoTooltip, { content: "Set the AI's ability to be more creative with outputs during conversation. 0 is closely sticking to the script & 1 is very creative conversations while still following the purpose of the prompt", className: "ml-1" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs text-gray-500", children: "0" }), _jsx("div", { className: "flex-1 relative", children: _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: aiCreativity, onChange: (e) => setAiCreativity(parseFloat(e.target.value)), className: "w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer", style: {
                                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${aiCreativity * 100}%, #e5e7eb ${aiCreativity * 100}%, #e5e7eb 100%)`,
                                                        } }) }), _jsx("span", { className: "text-xs text-gray-500", children: "1" })] })] })] }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-1", children: "Pre-made Prompts" }), _jsx("p", { className: "text-xs text-gray-500", children: "Templates" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-3", children: "Prompt" }), _jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: PROMPT_PLACEHOLDER, className: "w-full h-64 min-h-64 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 leading-relaxed placeholder:text-gray-300" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { onClick: handleCopyPrompt, className: "flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium", children: [_jsx(DocumentDuplicateIcon, { className: "w-4 h-4" }), "Copy"] }), _jsx("button", { onClick: handleSaveAgent, className: "px-6 py-2.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors text-sm font-medium", children: "Save Agent" })] })] }), _jsx(CalendarBookingModal, { isOpen: showCalendarModal, onClose: () => setShowCalendarModal(false), onSave: (config) => {
                    if (config.provider === "GHL") {
                        // Actualiza el estado local, el guardado se hará con el botón principal
                        setCalendarBookingConfig({
                            enabled: true,
                            provider: config.provider,
                            calendarId: config.calendarId,
                            timezone: config.timezone,
                        });
                        setShowCalendarModal(false);
                        addNotification({
                            type: "info",
                            title: "Configuración Lista",
                            message: "La configuración del calendario se guardará al guardar el agente.",
                        });
                    }
                    // Aquí se podría manejar la lógica para Cal.com si fuera necesario
                } }), _jsx(CallTransferModal, { isOpen: showCallTransferModal, onClose: () => setShowCallTransferModal(false), onSave: (config) => {
                    setCallTransferConfig(config);
                    setShowCallTransferModal(false);
                    addNotification({
                        type: "success",
                        title: "Configuración Guardada",
                        message: "La configuración de transferencia de llamadas se ha guardado.",
                    });
                } }), _jsx(WebhookConfigModal, { isOpen: showWebhookModal, onClose: () => setShowWebhookModal(false), onSave: (url) => {
                    setWebhookUrl(url);
                    setShowWebhookModal(false);
                    addNotification({
                        type: "success",
                        title: "Webhook URL Guardado",
                        message: "El webhook URL se ha guardado correctamente.",
                    });
                } }), _jsx(CustomVoiceModal, { isOpen: showCustomVoiceModal, onClose: () => setShowCustomVoiceModal(false), onSave: handleSaveCustomVoice }), showSignedUrlModal && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50", onClick: () => setShowSignedUrlModal(false), children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-2xl w-full mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(CheckIcon, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "\u00A1Agente Creado Exitosamente!" }), _jsx("p", { className: "text-sm text-gray-500", children: "Tu agente est\u00E1 listo para compartir" })] })] }), _jsx("button", { onClick: () => {
                                        setShowSignedUrlModal(false);
                                        navigate("/saved-agents");
                                    }, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "URL Compartible del Agente" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "text", value: signedUrl, readOnly: true, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm" }), _jsxs("button", { onClick: () => {
                                                navigator.clipboard.writeText(signedUrl);
                                                addNotification({
                                                    type: "success",
                                                    title: "URL Copiada",
                                                    message: "La URL se ha copiado al portapapeles",
                                                });
                                            }, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2", children: [_jsx(ClipboardDocumentIcon, { className: "w-5 h-5" }), _jsx("span", { children: "Copiar" })] })] })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(LinkIcon, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-blue-900 mb-1", children: "\u00BFC\u00F3mo usar esta URL?" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 Comparte esta URL con tus usuarios" }), _jsx("li", { children: "\u2022 Ellos podr\u00E1n hablar con tu agente directamente" }), _jsx("li", { children: "\u2022 La URL es segura y temporal" }), _jsx("li", { children: "\u2022 Puedes regenerar una nueva URL en cualquier momento" })] })] })] }) }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => {
                                        setShowSignedUrlModal(false);
                                        navigate("/saved-agents");
                                    }, className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "Ver Todos los Agentes" }), _jsx("button", { onClick: () => {
                                        setShowSignedUrlModal(false);
                                        navigate(`/inbound-agent?edit=${agentIdForSignedUrl}`);
                                    }, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Editar Agente" })] })] }) }))] }));
};
export default InboundAgent;
