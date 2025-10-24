import {
    CalendarIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    HomeIcon,
    LinkIcon,
    PhoneArrowUpRightIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CalendarBookingModal from "../components/modals/CalendarBookingModal";
import CallTransferModal from "../components/modals/CallTransferModal";
import CustomVoiceModal from "../components/modals/CustomVoiceModal";
import LaunchCallModal from "../components/modals/LaunchCallModal";
import WebhookConfigModal from "../components/modals/WebhookConfigModal";
import InfoTooltip from "../components/ui/InfoTooltip";
import StyledAudioPlayer from '../components/ui/StyledAudioPlayer';
import VoiceSelector from "../components/voice/VoiceSelector";
import { useAgents, useCreateAgent, useUpdateAgent } from "../hooks/useAgents";
import { useCreateCustomVoice, useCustomVoices } from "../hooks/useCustomVoices";
import { useElevenLabsOutboundCall, useElevenLabsVoices, useGetAgentSignedUrl } from "../hooks/useElevenLabs";
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

const OutboundAgent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editAgentId = searchParams.get("edit");

  const [agentName, setAgentName] = useState("");
  const [language, setLanguage] = useState("All");
  const [openingMessage, setOpeningMessage] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [doubleCall, setDoubleCall] = useState(false);
  const [vmDetection, setVmDetection] = useState(true);
  const [aiCreativity, setAiCreativity] = useState(0.7);
  const [interruptSensitivity, setInterruptSensitivity] = useState(true); // true = High
  const [responseSpeed, setResponseSpeed] = useState(true); // true = Sensitive
  const [initialMessageDelay, setInitialMessageDelay] = useState(4);
  const [webhookUrl, setWebhookUrl] = useState("");

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
  const [showLaunchCallModal, setShowLaunchCallModal] = useState(false);
  const [showSignedUrlModal, setShowSignedUrlModal] = useState(false);
  const [showCustomVoiceModal, setShowCustomVoiceModal] = useState(false);
  const [signedUrl, setSignedUrl] = useState("");
  const [agentIdForSignedUrl, setAgentIdForSignedUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
  const updateAgentMutation = useUpdateAgent();
  const addNotification = useAppStore((state) => state.addNotification);
  
  // Hook para hacer llamadas outbound
  const makeOutboundCall = useElevenLabsOutboundCall();
  
  // Hook para obtener URL firmada
  const getSignedUrlMutation = useGetAgentSignedUrl();

  const agentToEdit = React.useMemo(() => {
    return agents.find((a) => a.id === editAgentId);
  }, [agents, editAgentId]);

  // Ref para rastrear si ya se cargaron los datos del agente
  const hasLoadedAgentData = useRef(false);

  // Resetear el ref cuando cambie el editAgentId
  useEffect(() => {
    hasLoadedAgentData.current = false;
  }, [editAgentId]);

  // Cargar datos del agente si estamos editando
  useEffect(() => {
    if (agentToEdit && !hasLoadedAgentData.current) {
      setAgentName(agentToEdit.name);
      setOpeningMessage(agentToEdit.description || "");
      setPrompt(agentToEdit.preMadePrompt || prompt);
      setAiCreativity(agentToEdit.temperature);
      setLanguage(agentToEdit.language || 'All');
      
      // Solo intentar buscar la voz si las voces ya se cargaron
      if (elevenLabsVoices.length > 0) {
        // La propiedad correcta es 'voiceName' que ahora contiene el ID
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
      setDoubleCall(agentToEdit.doubleCall || false);
      setVmDetection(agentToEdit.vmDetection || false);
      setAiCreativity(agentToEdit.temperature || 0.7);
      setInterruptSensitivity(agentToEdit.interruptSensitivity || false);
      setResponseSpeed(agentToEdit.responseSpeed || true);
      // El valor del estado se mantiene en segundos para el slider
      setInitialMessageDelay(agentToEdit.initialMessageDelay ? agentToEdit.initialMessageDelay / 1000 : 4);
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

      // Marcar que ya se cargaron los datos
      hasLoadedAgentData.current = true;
    }
  }, [agentToEdit, elevenLabsVoices, prompt]); // Mantener las dependencias necesarias

  // Seleccionar la primera voz por defecto (solo si no estamos editando)
  useEffect(() => {
    if (!editAgentId && elevenLabsVoices.length > 0 && !selectedVoiceId) {
      setSelectedVoiceId(elevenLabsVoices[0].id);
    }
  }, [elevenLabsVoices, selectedVoiceId, editAgentId]);

  const handleCopyPrompt = () => {
    console.log("📋 handleCopyPrompt llamado");
    console.log("📋 Prompt:", prompt);
    navigator.clipboard.writeText(prompt);
    addNotification({
      type: "success",
      title: "Prompt Copiado",
      message: "El prompt se ha copiado al portapapeles",
    });
  };

  const handleLaunchCall = () => {
    console.log("📞 handleLaunchCall llamado");
    setShowLaunchCallModal(true);
  };

  // Calcular información de la voz seleccionada
  const selectedVoice = elevenLabsVoices.find(v => v.id === selectedVoiceId);
  
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
        console.log("🎤 OutboundAgent - Voz seleccionada:", selectedVoice);
        
        if ('isCustom' in selectedVoice && selectedVoice.isCustom) {
          console.log("🎤 OutboundAgent - Es una custom voice");
          return 'Custom Voice';
        }
        
        if ('labels' in selectedVoice && selectedVoice.labels) {
          const labels = selectedVoice.labels as any;
          console.log("🎤 OutboundAgent - Labels de la voz:", labels);
          
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
          console.log("🎤 OutboundAgent - Descripción calculada:", description);
          return description;
        }
        
        console.log("🎤 OutboundAgent - No hay labels disponibles");
        return undefined;
      })()
    : undefined;

  const handleSaveAgent = async () => {
    console.log("💾 handleSaveAgent llamado");
    
    // Prevenir múltiples clics
    if (isSaving) {
      console.log("⚠️ Ya se está guardando, ignorando clic adicional");
      return;
    }
    
    setIsSaving(true);
    
    try {
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

      // Validaciones
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

      const selectedVoice = elevenLabsVoices.find(
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
      console.log("🔐 Guardando agente con autenticación...");
      console.log("Token presente:", !!token);
      console.log("Account ID presente:", !!accountId);

      console.log("🎤 Voz seleccionada para guardar:", selectedVoiceId);
      
      const agentData = {
        name: agentName,
        description: openingMessage,
        openingMessage: openingMessage,
        type: "outbound" as const,
        voiceName: selectedVoiceId, // ENVIAR EL ID, NO EL NOMBRE
        language: language,
        preMadePrompt: prompt,
        maxTokens: 2000, // Valor optimizado para conversaciones telefónicas
        temperature: aiCreativity,
        status: "active" as const,
        // Configuraciones adicionales para ElevenLabs
        doubleCall: doubleCall,
        vmDetection: vmDetection,
        interruptSensitivity: interruptSensitivity,
        responseSpeed: responseSpeed,
        initialMessageDelay: initialMessageDelay * 1000, // Convertir a milisegundos
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
        // Actualizar agente existente
        await updateAgentMutation.mutateAsync({
          id: editAgentId,
          ...agentData,
        });
        
        // Mostrar mensaje de éxito
        console.log("✅ Mostrando notificación de éxito para actualización");
        addNotification({
          type: "success",
          title: "Agente Actualizado",
          message: "El agente se ha actualizado exitosamente",
        });
        
        // Redirigir a la lista de agentes guardados después de un breve delay
        setTimeout(() => {
          navigate("/saved-agents");
        }, 1500);
      } else {
        // Crear nuevo agente
        const newAgent = await createAgentMutation.mutateAsync(agentData);
        
        // Mostrar mensaje de éxito
        console.log("✅ Mostrando notificación de éxito para creación");
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
          // Redirigir a la lista de agentes guardados
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
          message: error?.message || "No se pudo guardar el agente",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayPreview = (voiceId: string) => {
    playPreview(voiceId, language);
  };

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

  const getVoiceById = (id: string | null) => {
    if (!id) return null;
    return elevenLabsVoices?.find(v => v.id === id);
  }

  // Effect to handle form reset and initial state
  useEffect(() => {
    if (location.state?.agent) {
      const agent = location.state.agent;
      setAgentName(agent.name);
      setOpeningMessage(agent.description || "");
      setPrompt(agent.preMadePrompt || prompt);
      setAiCreativity(agent.temperature);
      setSelectedVoiceId(agent.voiceId);
    }
  }, [location.state?.agent, prompt]);

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
          <h1 className="text-2xl font-bold text-gray-900">
            {editAgentId ? "Edit Outbound Agent" : "Create Outbound Agent"}
          </h1>
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
                content="This setting informs the AI of the language the user will be speaking, enabling it to accurately translate the conversation."
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
        </div>
        
        {/* Opening Message */}
        <div className="mb-8">
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
            className="w-1/3 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
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

        {/* Dynamic Player Section */}
        <div className="my-8">
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

        {/* Action Icons & Settings */}
        <div className="max-w-4xl mx-auto">
          {/* Three Action Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
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

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {/* Double Call */}
            <div>
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Double Call
                </label>
                <InfoTooltip
                  content="Enable or disable double call detection to prevent duplicate calls to the same contact."
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">False</span>
                <button
                  onClick={() => setDoubleCall(!doubleCall)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    doubleCall ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      doubleCall ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">True</span>
              </div>
            </div>

            {/* VM Detection */}
            <div>
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  VM Detection (Beta)
                </label>
                <InfoTooltip
                  content="Automatically detect when a call goes to voicemail and handle it appropriately."
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Off</span>
                <button
                  onClick={() => setVmDetection(!vmDetection)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    vmDetection ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      vmDetection ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">On</span>
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

            {/* Initial Message Delay */}
            <div>
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Initial Message Delay
                </label>
                <InfoTooltip
                  content="Set the delay in seconds before the AI starts speaking when the call is answered."
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">0 (sec)</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={initialMessageDelay}
                    onChange={(e) =>
                      setInitialMessageDelay(parseInt(e.target.value))
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(initialMessageDelay / 8) * 100}%, #e5e7eb ${(initialMessageDelay / 8) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">8 (sec)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-made Prompts */}
        <div className="mb-6 mt-10">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handleLaunchCall}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Launch A Call
          </button>
          <button
            onClick={handleSaveAgent}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-md transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
              isSaving
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed transform scale-95'
                : 'bg-blue-900 text-white hover:bg-blue-800 hover:scale-105 active:scale-95'
            }`}
          >
            {isSaving && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSaving ? 'Guardando...' : 'Save Agent'}
          </button>
        </div>
      </div>

      {/* Calendar Booking Modal */}
      <CalendarBookingModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        currentConfig={calendarBookingConfig.enabled ? {
          provider: calendarBookingConfig.provider as "GHL" | "Cal.com",
          calendarId: calendarBookingConfig.calendarId,
          timezone: calendarBookingConfig.timezone
        } as any : undefined}
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

      {/* Launch Call Modal */}
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
                  navigate(`/outbound-agent?edit=${agentIdForSignedUrl}`);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar Agente
              </button>
            </div>
          </div>
        </div>
      )}

      <LaunchCallModal
        isOpen={showLaunchCallModal}
        onClose={() => setShowLaunchCallModal(false)}
        onLaunch={async (fromNumber, toNumber, agentId, phoneNumberId) => {
          try {
            // Verificar que el agente esté guardado
            if (!editAgentId) {
              addNotification({
                type: "error",
                title: "Agente no guardado",
                message: "Debes guardar el agente antes de hacer una llamada",
              });
              return;
            }

            // Verificar que el número de teléfono sea válido
            if (!toNumber || toNumber.trim() === "") {
              addNotification({
                type: "error",
                title: "Número inválido",
                message: "Por favor ingresa un número de teléfono válido",
              });
              return;
            }

            // Verificar que se haya seleccionado un número de Twilio
            if (!phoneNumberId) {
              addNotification({
                type: "error",
                title: "Número de Twilio requerido",
                message: "Debes seleccionar un número de Twilio para realizar la llamada",
              });
              return;
            }

            addNotification({
              type: "info",
              title: "Iniciando llamada",
              message: `Llamando a ${toNumber}...`,
            });

            // Realizar la llamada
            const result = await makeOutboundCall.mutateAsync({
              agentId: editAgentId,
              agentPhoneNumberId: phoneNumberId,
              toNumber: toNumber,
              conversationInitiationClientData: {
                agentName: agentName,
                openingMessage: openingMessage,
                prompt: prompt,
                temperature: aiCreativity,
              },
            });

            console.log("Llamada exitosa:", result);

            addNotification({
              type: "success",
              title: "Llamada iniciada",
              message: `Llamada a ${toNumber} iniciada exitosamente`,
            });

            setShowLaunchCallModal(false);
          } catch (error: any) {
            console.error("Error al realizar la llamada:", error);
            
            // Solo mostrar en consola, no en la interfaz
            const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al realizar la llamada";
            console.log("🔧 Llamadas outbound no disponibles en desarrollo. Configura el webhook en producción para habilitar esta funcionalidad.");
            
            // No mostrar notificación de error al usuario
          }
        }}
        agentId={editAgentId || undefined}
      />
    </div>
  );
};

export default OutboundAgent;
