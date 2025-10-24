import {
    CalendarIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    HomeIcon,
    LinkIcon,
    PhoneArrowUpRightIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
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

const InboundAgent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editAgentId = searchParams.get("edit");

  const [agentName, setAgentName] = useState("");
  const [language, setLanguage] = useState("All");
  const [openingMessage, setOpeningMessage] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [aiCreativity, setAiCreativity] = useState(0.7);
  const [interruptSensitivity, setInterruptSensitivity] = useState(false);
  const [responseSpeed, setResponseSpeed] = useState(true);

  // Hook para el preview dinámico de voz
  const { 
    playPreview, 
    pause,
    seek,
    isPlaying: isPreviewPlaying, 
    isLoading: isPreviewLoading, 
    duration, 
    currentTime, 
    currentVoiceId: playingVoiceId,
    volume,
    handleVolumeChange,
  } = useVoicePreview();

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCallTransferModal, setShowCallTransferModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showSignedUrlModal, setShowSignedUrlModal] = useState(false);
  const [showCustomVoiceModal, setShowCustomVoiceModal] = useState(false);
  const [signedUrl, setSignedUrl] = useState("");
  const [agentIdForSignedUrl, setAgentIdForSignedUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [callTransferConfig, setCallTransferConfig] = useState({
    type: "prompt" as "prompt" | "keyword",
    phoneNumber: "",
    keywords: [] as string[],
    businessHours: false,
  });

  const [calendarBookingConfig, setCalendarBookingConfig] = useState({
    enabled: false,
    provider: "GHL",
    calendarId: "",
    timezone: "",
  });

  // Hooks para backend
  const { data: elevenLabsVoices = [], isLoading: voicesLoading, error: voicesError } =
    useElevenLabsVoices(
      language === "All" ? undefined : language.toLowerCase(),
    );

  const { data: customVoices = [] } = useCustomVoices();
  const createCustomVoiceMutation = useCreateCustomVoice();

  const { data: agents = [] } = useAgents();
  const createAgentMutation = useCreateAgent();

  const handlePlayPreview = (voiceId: string) => {
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
  const handleSaveCustomVoice = async (config: any, name: string) => {
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
    } catch (error: any) {
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
        } else {
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
        message:
          "Debes iniciar sesión para crear agentes. Redirigiendo al login...",
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

    const selectedVoice = allVoices.find(
      (v) => v.id === selectedVoiceId,
    );
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
        type: "inbound" as const,
        voiceName: selectedVoiceId, // ENVIAR EL ID, NO EL NOMBRE
        preMadePrompt: prompt,
        maxTokens: 4000, // Corregido: máximo permitido por el backend
        temperature: aiCreativity,
        status: "active" as const,
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
      } else {
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
        } catch (error) {
          console.error("❌ Error obteniendo URL firmada:", error);
          // No bloquear el flujo si falla obtener la URL
          navigate("/saved-agents");
        }
      }
    } catch (error: any) {
      console.error("❌ Error al guardar agente:", error);

      // Manejar errores específicos de autenticación
      if (error?.status === 401) {
        addNotification({
          type: "error",
          title: "Sesión Expirada",
          message:
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        });

        // Limpiar tokens y redirigir
        localStorage.removeItem("auth_token");
        localStorage.removeItem("accountId");
        localStorage.removeItem("user_data");

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        addNotification({
          type: "error",
          title: editAgentId ? "Error al Actualizar" : "Error al Crear",
          message:
          (error as any)?.message || "No se pudo guardar el agente",
        });
      }
    }
  };

  const selectedVoice = allVoices.find(v => v.id === selectedVoiceId);
  // Función para convertir nombres de idiomas a abreviaturas
  const getLanguageAbbreviations = (languages: string[]): string => {
    const languageMap: { [key: string]: string } = {
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
          const labels = selectedVoice.labels as any;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb - Top Right */}
      <div className="flex items-center justify-end py-4 px-6 text-sm text-gray-500">
        <HomeIcon className="w-4 h-4" />
        <span className="mx-2">{">"}</span>
        <span className="text-gray-900 font-medium">Voice Agent</span>
      </div>

      <div className="w-full px-6 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Voice Agent</h1>
          <h2 className="text-lg text-gray-600">
            {editAgentId ? "Edit Inbound Agent" : "Create Inbound Agent"}
          </h2>
        </div>

        {/* Agent Name and Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Agent Name */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                Agent Name *
              </label>
              <InfoTooltip
                content="A unique name for your agent that will help you identify it later."
                className="ml-1"
              />
            </div>
            <p className="text-xs text-gray-500 mb-2">Required</p>
            <input
              type="text"
              placeholder="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Change Language */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                Change Language
              </label>
              <InfoTooltip
                content="This setting informs the AI of the language the user will be speaking."
                className="ml-1"
              />
            </div>
            <p className="text-xs text-gray-500 mb-2">Languages</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="All">All Languages</option>
              <option value="Multilingual">
                Multilingual (English, Spanish, French, German, Hindi, Russian,
                Portuguese, Japanese, Italian, Dutch)
              </option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Hindi">Hindi</option>
              <option value="Russian">Russian</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Japanese">Japanese</option>
              <option value="Italian">Italian</option>
              <option value="Dutch">Dutch</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Korean">Korean</option>
              <option value="Bulgarian">Bulgarian</option>
              <option value="Catalan">Catalan</option>
              <option value="Chinese (Mandarin)">Chinese (Mandarin)</option>
              <option value="Chinese (Cantonese)">Chinese (Cantonese)</option>
              <option value="Czech">Czech</option>
              <option value="Danish">Danish</option>
              <option value="Estonian">Estonian</option>
              <option value="Finnish">Finnish</option>
              <option value="Flemish">Flemish</option>
              <option value="French (Canada)">French (Canada)</option>
              <option value="German (Switzerland)">German (Switzerland)</option>
              <option value="Greek">Greek</option>
              <option value="Hungarian">Hungarian</option>
              <option value="Latvian">Latvian</option>
              <option value="Lithuanian">Lithuanian</option>
              <option value="Malay">Malay</option>
              <option value="Norwegian">Norwegian</option>
              <option value="Polish">Polish</option>
              <option value="Romanian">Romanian</option>
              <option value="Slovak">Slovak</option>
              <option value="Swedish">Swedish</option>
              <option value="Thai">Thai</option>
              <option value="Turkish">Turkish</option>
              <option value="Ukrainian">Ukrainian</option>
              <option value="Vietnamese">Vietnamese</option>
            </select>
          </div>
        
          {/* Opening Message */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                Opening Message
              </label>
              <InfoTooltip
                content="The first message the AI will say when the call starts. For example: 'Hey, this Alex, who am I speaking with?'"
                className="ml-1"
              />
            </div>
             <p className="text-xs text-gray-500 mb-2 invisible">Placeholder</p> {/* Ocupa espacio para alinear */}
            <input
              type="text"
              placeholder="Opening Message"
              value={openingMessage}
              onChange={(e) => setOpeningMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>


        {/* Curated Voices */}
        <VoiceSelector
          voices={allVoices}
          selectedVoiceId={selectedVoiceId}
          onSelectVoice={(voiceId) => {
            console.log("🎤 Voz seleccionada:", voiceId);
            setSelectedVoiceId(voiceId);
          }}
          onAddCustomVoice={handleAddCustomVoice}
          isLoading={voicesLoading}
          error={voicesError}
        />

        {/* Audio Player */}
        <div className="max-w-4xl mx-auto mb-8">
          <StyledAudioPlayer
            isPlaying={isPreviewPlaying}
            isLoading={isPreviewLoading}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            voiceName={selectedVoice?.name}
            voiceDescription={voiceDescription}
            onPlayPause={() => {
              if (playingVoiceId) {
                // Si hay una voz reproduciéndose, toggle play/pause
                if (isPreviewPlaying) {
                  pause();
                } else {
                  handlePlayPreview(playingVoiceId);
                }
              } else if (selectedVoiceId) {
                // Si no hay ninguna reproduciéndose, empieza la seleccionada
                handlePlayPreview(selectedVoiceId);
              }
            }}
            onSeek={seek}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        {/* Three Action Icons */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 mb-10">
            {/* Calendar Booking */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Calendar Booking
                </label>
                <InfoTooltip
                  content="We organize and display your calendar availability into distinct time slots for scheduling appointments. Here is an example of the available slots for booking: Friday: From 10:00 A.M. to 11:00 A.M. and from 11:15 A.M. to 12:00 P.M. These time slots represent the periods during which appointments can be scheduled"
                  className="ml-1"
                />
              </div>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <CalendarIcon className="w-9 h-9 text-blue-500" />
              </button>
            </div>

            {/* Call Transfer */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Call Transfer
                </label>
                <InfoTooltip
                  content="If certain conditions are met during the call, this action allows the system to transfer the call to another specified phone number"
                  className="ml-1"
                />
              </div>
              <button
                onClick={() => setShowCallTransferModal(true)}
                className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <PhoneArrowUpRightIcon className="w-9 h-9 text-blue-500" />
              </button>
            </div>

            {/* Advanced Options */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Advanced Options
                </label>
                <InfoTooltip
                  content="Additional Configurations"
                  className="ml-1"
                />
              </div>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <Cog6ToothIcon className="w-9 h-9 text-blue-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Row - SOLO UNA FILA (diferente de Outbound) */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-12 mb-10">
            {/* Interrupt Sensitivity */}
            <div>
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Interrupt Sensitivity
                </label>
                <InfoTooltip
                  content="Determines how sensitive the system is to interruptions."
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Low</span>
                <button
                  onClick={() => setInterruptSensitivity(!interruptSensitivity)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    interruptSensitivity ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      interruptSensitivity ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">High</span>
              </div>
            </div>

            {/* Response Speed */}
            <div>
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Response Speed
                </label>
                <InfoTooltip
                  content="Controls how the bot determines when the human is done speaking so it can kick off its response."
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Auto</span>
                <button
                  onClick={() => setResponseSpeed(!responseSpeed)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    responseSpeed ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      responseSpeed ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Sensitive</span>
              </div>
            </div>

            {/* AI Creativity */}
            <div>
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  AI Creativity
                </label>
                <InfoTooltip
                  content="Set the AI's ability to be more creative with outputs during conversation. 0 is closely sticking to the script & 1 is very creative conversations while still following the purpose of the prompt"
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">0</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiCreativity}
                    onChange={(e) =>
                      setAiCreativity(parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${aiCreativity * 100}%, #e5e7eb ${aiCreativity * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-made Prompts */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Pre-made Prompts
          </h3>
          <p className="text-xs text-gray-500">Templates</p>
        </div>

        {/* Prompt */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Prompt</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PROMPT_PLACEHOLDER}
            className="w-full h-64 min-h-64 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 leading-relaxed placeholder:text-gray-300"
          />
        </div>

        {/* Action Buttons - SOLO Copy y Save Agent (NO Launch A Call) */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handleSaveAgent}
            className="px-6 py-2.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors text-sm font-medium"
          >
            Save Agent
          </button>
        </div>
      </div>

      {/* Calendar Booking Modal */}
      <CalendarBookingModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSave={(config) => {
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
        }}
      />

      {/* Call Transfer Modal */}
      <CallTransferModal
        isOpen={showCallTransferModal}
        onClose={() => setShowCallTransferModal(false)}
        onSave={(config) => {
          setCallTransferConfig(config);
setShowCallTransferModal(false);
          addNotification({
            type: "success",
            title: "Configuración Guardada",
            message: "La configuración de transferencia de llamadas se ha guardado.",
          });
        }}
      />

      {/* Webhook Config Modal */}
      <WebhookConfigModal
        isOpen={showWebhookModal}
        onClose={() => setShowWebhookModal(false)}
        onSave={(url) => {
          setWebhookUrl(url);
          setShowWebhookModal(false);
          addNotification({
            type: "success",
            title: "Webhook URL Guardado",
            message: "El webhook URL se ha guardado correctamente.",
          });
        }}
      />

      {/* Custom Voice Modal */}
      <CustomVoiceModal
        isOpen={showCustomVoiceModal}
        onClose={() => setShowCustomVoiceModal(false)}
        onSave={handleSaveCustomVoice}
      />

      {/* Signed URL Modal */}
      {showSignedUrlModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowSignedUrlModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    ¡Agente Creado Exitosamente!
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tu agente está listo para compartir
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSignedUrlModal(false);
                  navigate("/saved-agents");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Compartible del Agente
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={signedUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signedUrl);
                    addNotification({
                      type: "success",
                      title: "URL Copiada",
                      message: "La URL se ha copiado al portapapeles",
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    ¿Cómo usar esta URL?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Comparte esta URL con tus usuarios</li>
                    <li>• Ellos podrán hablar con tu agente directamente</li>
                    <li>• La URL es segura y temporal</li>
                    <li>• Puedes regenerar una nueva URL en cualquier momento</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSignedUrlModal(false);
                  navigate("/saved-agents");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver Todos los Agentes
              </button>
              <button
                onClick={() => {
                  setShowSignedUrlModal(false);
                  navigate(`/inbound-agent?edit=${agentIdForSignedUrl}`);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar Agente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundAgent;
