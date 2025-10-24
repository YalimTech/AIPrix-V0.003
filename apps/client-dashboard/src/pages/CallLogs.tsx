import {
    BackwardIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    FlagIcon,
    ForwardIcon,
    HomeIcon,
    PauseIcon,
    PlayIcon,
    SparklesIcon,
    SpeakerWaveIcon,
    StarIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon as PlayIconSolid } from "@heroicons/react/24/solid";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import DatePicker from "../components/ui/DatePicker";
import InfoTooltip from "../components/ui/InfoTooltip";
import {
    useConversationFeedback,
    useDownloadConversationAudio,
} from "../hooks/useConversations";
import {
    useBulkDeleteCallLogs,
    useCallLogs,
    useDeleteCallLog,
} from "../hooks/useDashboard";
import { apiClient } from "../lib/api";
import { formatDuration, formatISODate, formatISOTime } from "../lib/utils";

interface CallLog {
  id: string;
  contactName: string;
  agentName: string;
  contactNumber: string;
  agentNumber: string;
  outcome: string;
  direction: string;
  date: string;
  duration: string;
  recording?: string;
  transcript?: string;
}

const CallLogs: React.FC = () => {
  // Obtener el Account ID del usuario logueado
  const accountId = localStorage.getItem("accountId") || "";

  // Filters - mapeados a los filtros de ElevenLabs
  const [clientId, setClientId] = useState(accountId);
  const [contactName, setContactName] = useState("");
  const [contactNumberOrAgent, setContactNumberOrAgent] = useState("");
  // Usar fechas reales: últimos 30 días
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  // Asegurar que "To" incluya todo el día actual
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [toDate, setToDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [callDuration, setCallDuration] = useState("");
  const [outcome, setOutcome] = useState("");
  const [direction, setDirection] = useState("");
  const [agentNameOrId, setAgentNameOrId] = useState("");
  const [campaign, setCampaign] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ref para evitar múltiples requests
  const lastRequestRef = useRef<string>("");
  const isRequestingRef = useRef<boolean>(false);

  // Estado para controlar la aplicación de filtros
  const [applyFilters, setApplyFilters] = useState(false);

  // Estado para controlar cuando hacer requests
  const [shouldFetch, setShouldFetch] = useState(true);

  // Estado para detalles de conversación
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<"like" | "dislike" | null>(
    null,
  );

  // Estado para reportar issues
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportingConversationId, setReportingConversationId] = useState<
    string | null
  >(null);

  // Estado para eliminación
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    callId?: string;
    callIds?: string[];
  } | null>(null);

  // Estado para el reproductor de audio
  const [currentPlayingConversation, setCurrentPlayingConversation] = useState<
    string | null
  >(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isBlobUrl, setIsBlobUrl] = useState<boolean>(false);

  // Estado para manejar transcripciones largas
  const [transcriptExpanded, setTranscriptExpanded] = useState<boolean>(false);
  const [transcriptTruncated, setTranscriptTruncated] =
    useState<boolean>(false);

  // Hook para obtener llamadas de la base de datos local
  const {
    data: callsData,
    isLoading,
    error,
    refetch,
  } = useCallLogs(
    useMemo(() => {
      const filters = applyFilters
        ? {
            from: fromDate || undefined,
            to: toDate || undefined,
            outcome: outcome || undefined,
            direction: direction || undefined,
            campaign: campaign || undefined,
            contactName: contactName || undefined,
            contactNumber: contactNumberOrAgent || undefined,
            agentName: agentNameOrId || undefined,
            callDuration: callDuration || undefined,
            clientId: clientId || undefined,
            limit: itemsPerPage,
            page: currentPage,
          }
        : {
            clientId: clientId || undefined, // Siempre incluir clientId para cargar datos iniciales
            limit: itemsPerPage, // Cargar datos iniciales sin filtros
            page: currentPage,
          };

      // Crear una clave única para el request
      const requestKey = JSON.stringify(filters);

      // Solo actualizar si la clave es diferente y no hay un request en progreso
      if (lastRequestRef.current !== requestKey && !isRequestingRef.current) {
        lastRequestRef.current = requestKey;
        isRequestingRef.current = true;
        console.log("🔄 Nuevo request con filtros:", filters);

        // Reset el flag después de un delay
        setTimeout(() => {
          isRequestingRef.current = false;
        }, 500);
      }

      return filters;
    }, [
      applyFilters,
      fromDate,
      toDate,
      outcome,
      direction,
      campaign,
      contactName,
      contactNumberOrAgent,
      agentNameOrId,
      callDuration,
      clientId,
      itemsPerPage,
      currentPage,
      shouldFetch,
    ]),
  );

  const conversations = (callsData as any)?.calls || [];
  const totalCalls = (callsData as any)?.total || 0;

  // Pagination logic
  const totalPages = Math.ceil(totalCalls / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // useEffect para manejar cambios de paginación
  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false);
    }
  }, [currentPage, itemsPerPage, shouldFetch]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setShouldFetch(true);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setShouldFetch(true);
  }, []);

  // Debug: Log the data structure (solo cuando cambian los datos)
  useEffect(() => {
    if (callsData) {
      console.log("🔍 [CallLogs] callsData structure:", {
        callsData,
        calls: (callsData as any)?.calls,
        total: (callsData as any)?.total,
        error: (callsData as any)?.error,
        dataSources: (callsData as any)?.dataSources,
      });

      console.log("🔍 [CallLogs] conversations array:", conversations);
      console.log("🔍 [CallLogs] conversations length:", conversations.length);
    }
  }, [callsData, conversations]);

  // Obtener datos de la llamada seleccionada desde los datos locales
  const selectedCall = conversations.find(
    (c: any) => c.id === selectedConversationId,
  );

  // Hooks para acciones
  const sendFeedback = useConversationFeedback();
  const downloadAudio = useDownloadConversationAudio();
  const deleteCallLog = useDeleteCallLog();
  const bulkDeleteCallLogs = useBulkDeleteCallLogs();

  // Audio element reference
  const audioRef = useRef<HTMLAudioElement>(null);

  // Effect to handle audio element and duration
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;

      console.log("🎵 Configurando elemento audio con URL:", audioUrl);

      // Set audio source
      audio.src = audioUrl;

      // Event listeners
      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
        console.log("🎵 Audio metadata loaded, duration:", audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handlePlay = () => {
        setIsPlaying(true);
        console.log("▶️ Audio started playing");
      };

      const handlePause = () => {
        setIsPlaying(false);
        console.log("⏸️ Audio paused");
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        console.log("⏹️ Audio ended");
      };

      const handleError = (e: Event) => {
        console.error("❌ Audio error:", e);
        console.error("❌ Audio error details:", {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src,
        });
        alert(
          "Error al reproducir el audio. Verifica que el formato sea compatible.",
        );
      };

      const handleCanPlay = () => {
        console.log("✅ Audio can play");
        // Reproducir automáticamente cuando el audio esté listo
        if (currentPlayingConversation) {
          console.log("🎵 Iniciando reproducción automática...");
          audio.play().catch((error) => {
            console.error("❌ Error iniciando reproducción automática:", error);
          });
        }
      };

      // Add event listeners
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);
      audio.addEventListener("canplay", handleCanPlay);

      // Cleanup
      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("canplay", handleCanPlay);

        // Limpiar blob URL si es necesario
        if (isBlobUrl && audioUrl && audioUrl.startsWith("blob:")) {
          URL.revokeObjectURL(audioUrl);
        }
      };
    }
  }, [audioUrl, isBlobUrl, currentPlayingConversation]);

  // Cleanup blob URL on component unmount
  useEffect(() => {
    return () => {
      if (isBlobUrl && audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Funciones para manejar conversaciones
  const handleViewTranscript = (callId: string) => {
    setSelectedConversationId(callId);
    setShowTranscript(true);
  };

  // Función para manejar la expansión de transcripciones
  const handleTranscriptToggle = () => {
    setTranscriptExpanded(!transcriptExpanded);
  };

  // Función para verificar si una transcripción es larga
  const isTranscriptLong = (transcript: any[]) => {
    if (!transcript || transcript.length === 0) return false;
    const totalLength = transcript.reduce(
      (acc, message) => acc + (message.message?.length || 0),
      0,
    );
    return totalLength > 2000; // Considerar larga si tiene más de 2000 caracteres
  };

  const handlePlayRecording = async (callId: string) => {
    try {
      // Establecer la conversación actual que se está reproduciendo
      setCurrentPlayingConversation(callId);

      // Buscar la llamada en los datos para obtener el elevenLabsConversationId
      const call = conversations.find((c: any) => c.id === callId);
      if (!call) {
        console.error("❌ Llamada no encontrada:", callId);
        return;
      }

      // Si hay recordingUrl, usarla directamente
      if (call.recordingUrl) {
        console.log("🎵 Usando URL de grabación existente:", call.recordingUrl);
        setAudioUrl(call.recordingUrl);
        return;
      }

      // Si no hay recordingUrl, intentar obtenerla desde ElevenLabs
      if (call.elevenLabsConversationId) {
        console.log("🔍 Obteniendo audio desde ElevenLabs...");
        const audioData: any = await apiClient.get(
          `/conversations/${callId}/audio`,
        );

        console.log("🎵 Datos de audio recibidos:", audioData);

        // Verificar si la respuesta tiene una URL de audio
        if (audioData.audioUrl) {
          if (audioData.isStream) {
            // Si es un stream, usar la URL directamente para streaming
            console.log("🔄 Configurando streaming de audio...");
            console.log("🎵 URL de stream:", audioData.audioUrl);
            console.log("🎵 Formato:", audioData.format);
            console.log("🎵 Duración:", audioData.duration);

            // Para streams, construir la URL completa usando el puerto correcto del API
            const apiBaseUrl =
              import.meta.env.MODE === "development"
                ? `${import.meta.env.VITE_APP_URL || `${import.meta.env.VITE_API_PROTOCOL || "http"}://${import.meta.env.VITE_API_HOST || "localhost"}:${import.meta.env.VITE_PORT || "3000"}`}/api/v1`
                : `${import.meta.env.VITE_APP_URL || "https://agent.prixcenter.com"}/api/v1`;

            // Obtener el token de autenticación
            const token = localStorage.getItem("auth_token");
            const fullAudioUrl = `${apiBaseUrl}${audioData.audioUrl}?token=${token}`;
            setAudioUrl(fullAudioUrl);
            setIsBlobUrl(false);
            console.log(
              "✅ Stream de audio configurado para reproducción directa:",
              fullAudioUrl,
            );
          } else {
            // Si no es un stream, usar la URL directamente
            setAudioUrl(audioData.audioUrl);
            setIsBlobUrl(false);
            console.log(
              "✅ Audio cargado en el reproductor:",
              audioData.audioUrl,
            );
          }
        } else {
          console.warn("⚠️ No se encontró URL de audio en la respuesta");
          setAudioUrl(null);
          setIsBlobUrl(false);
          setCurrentPlayingConversation(null);
          alert("No se pudo cargar el audio de esta conversación.");
        }
      } else {
        console.warn("⚠️ No hay elevenLabsConversationId disponible");
        setAudioUrl(null);
        setIsBlobUrl(false);
        setCurrentPlayingConversation(null);
        alert("No hay audio disponible para esta conversación.");
      }
    } catch (error: any) {
      console.error("❌ Error cargando audio:", error);
      setAudioUrl(null);
      setIsBlobUrl(false);
      setCurrentPlayingConversation(null);
      alert(
        `Error al cargar el audio: ${error.message || "Error desconocido"}`,
      );
    }
  };

  const handleFeedback = async (
    conversationId: string,
    feedback: "like" | "dislike",
  ) => {
    try {
      console.log(
        `👍 Enviando feedback "${feedback}" para conversación ${conversationId}`,
      );

      await sendFeedback.mutateAsync({ conversationId, feedback });
      setFeedbackSent(feedback);

      console.log(
        `✅ Feedback "${feedback}" enviado exitosamente para conversación ${conversationId}`,
      );
    } catch (error) {
      console.error(
        `❌ Error enviando feedback "${feedback}" para conversación ${conversationId}:`,
        error,
      );
    }
  };

  const handleCopyConversation = () => {
    if (!selectedCall || !selectedCall.transcript) return;

    const fullText = `Llamada #${selectedCall.id}
Agente: ${selectedCall.agentName}
Estado: ${selectedCall.status}
Fecha: ${formatISODate(selectedCall.startTime)}
Duración: ${formatDuration(selectedCall.duration)}

Transcripción:
${selectedCall.transcript}`;

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        // Mostrar feedback visual de que se copió
        const button = document.querySelector(
          "[data-copy-button]",
        ) as HTMLButtonElement;
        if (button) {
          const originalText = button.textContent;
          button.textContent = "¡Copiado!";
          button.classList.add("bg-green-600", "text-white");
          button.classList.remove("bg-blue-600");
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("bg-green-600", "text-white");
            button.classList.add("bg-blue-600");
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Error copiando al portapapeles:", err);
      });
  };

  const handleReportIssue = (conversationId: string) => {
    setReportingConversationId(conversationId);
    setReportDescription("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportDescription.trim() || !reportingConversationId) return;

    try {
      // Aquí iría la lógica para enviar el reporte a la API
      console.log(
        "Reportando issue para conversación:",
        reportingConversationId,
      );
      console.log("Descripción del issue:", reportDescription);

      // Simular envío exitoso
      alert("Report sent successfully. Thank you for your feedback.");

      // Cerrar modal y limpiar estado
      setShowReportModal(false);
      setReportDescription("");
      setReportingConversationId(null);
    } catch (error) {
      console.error("Error enviando reporte:", error);
      alert("Error sending the report. Please try again.");
    }
  };

  // Funciones para manejar eliminación
  const handleDeleteCall = (callId: string) => {
    setDeleteTarget({ type: "single", callId });
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedCalls.size === 0) return;
    setDeleteTarget({ type: "bulk", callIds: Array.from(selectedCalls) });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "single" && deleteTarget.callId) {
        await deleteCallLog.deleteCallLog(deleteTarget.callId);
        console.log(
          `✅ Conversación ${deleteTarget.callId} eliminada exitosamente`,
        );
      } else if (deleteTarget.type === "bulk" && deleteTarget.callIds) {
        await bulkDeleteCallLogs.bulkDeleteCallLogs(deleteTarget.callIds);
        console.log(
          `✅ ${deleteTarget.callIds.length} conversaciones eliminadas exitosamente`,
        );
        setSelectedCalls(new Set()); // Limpiar selección
      }

      // Refrescar la lista de conversaciones
      refetch();

      // Cerrar modal
      setShowDeleteModal(false);
      setDeleteTarget(null);

      // Mostrar mensaje de éxito
      const message =
        deleteTarget.type === "single"
          ? "Conversación eliminada exitosamente"
          : `${deleteTarget.callIds?.length || 0} conversaciones eliminadas exitosamente`;
      alert(message);
    } catch (error) {
      console.error("Error eliminando conversaciones:", error);
      alert(
        "Error al eliminar las conversaciones. Por favor, inténtalo de nuevo.",
      );
    }
  };

  const handleSelectCall = (callId: string) => {
    const newSelected = new Set(selectedCalls);
    if (newSelected.has(callId)) {
      newSelected.delete(callId);
    } else {
      newSelected.add(callId);
    }
    setSelectedCalls(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCalls.size === conversations.length) {
      setSelectedCalls(new Set());
    } else {
      setSelectedCalls(new Set(conversations.map((c: any) => c.id)));
    }
  };

  // Modals
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState("");
  const [selectedTranscriptDate, setSelectedTranscriptDate] = useState("");
  const [customPrompt, setCustomPrompt] = useState(false);
  const [customPromptText, setCustomPromptText] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [reportIssueDescription, setReportIssueDescription] = useState("");

  // Audio Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  // Use real data from API - no mock data
  const filters = {
    clientId,
    contactName,
    contactNumberOrAgent,
    fromDate,
    toDate,
    callDuration,
    outcome,
    direction,
    agentNameOrId,
    campaign,
  };

  // Handle loading and error states
  if (false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando registros de llamadas...</p>
        </div>
      </div>
    );
  }

  if (false) {
    const errorMessage = (error as any)?.message || "Error desconocido";
    const isNetworkError =
      errorMessage.includes("Network Error") || errorMessage.includes("fetch");
    const isServerError = errorMessage.includes("Error del servidor");
    const isNotFoundError = errorMessage.includes("no están disponibles");

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            {isNetworkError ? (
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            ) : isServerError ? (
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <XMarkIcon className="h-12 w-12 mx-auto" />
            )}
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isNetworkError
              ? "Problema de Conexión"
              : isServerError
                ? "Error del Servidor"
                : isNotFoundError
                  ? "Servicio Temporalmente No Disponible"
                  : "Error al Cargar los Registros"}
          </h3>

          <p className="text-gray-600 mb-6">
            {isNetworkError
              ? "Verifica tu conexión a internet e inténtalo de nuevo."
              : isServerError
                ? "El servidor está experimentando problemas. Por favor, inténtalo más tarde."
                : isNotFoundError
                  ? "Los registros de llamadas no están disponibles en este momento."
                  : errorMessage}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                // Usar React Query para recargar datos en lugar de recarga completa
                // window.location.reload(); // Comentado para evitar recarga completa
                // La recarga se manejará por React Query automáticamente
                console.log("🔄 Refreshing call logs data via React Query...");
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            {!isNetworkError && (
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Summary content template
  const summaryContent = `AI Agent Call Log Summary Report

1. KPI Summary
• Total Calls: 3 (100%)
• Answered: 2 (66.67%)
• Did Not Answer (Voicemail): 1 (33.33%)
• Call Did Not Connect (Busy/No Answer): 0 (0%)
• Booked Appointments: 0 (0%)
• Calls < 20 seconds: 1 (33.33%)
• Calls 20–50 seconds: 1 (33.33%)
• Calls > 50 seconds: 1 (33.33%)
• Total Spent: $1.14
• Total Minutes: 8.78

2. Key Observations

High Answer Rate: With 66.67% of calls answered, the answer rate is strong for initial outreach efforts.

Did Not Answer / Voicemail: Only 1 call (33.33%) went to voicemail, indicating relatively good contact accuracy, but improvements can still boost connection rates.

Short Calls (<20s): 1 call (33.33%) was extremely short and only reached voicemail, indicating minimal actual engagement.

Medium Calls (20–50s): 1 call (33.33%) was under a minute, with the conversation only progressing to the initial service list. This may suggest opportunities to enhance the hook or pitch.

Detailed Engagement: The longest call (nearly 8 minutes) featured substantial engagement, strong rapport, and data collection from the lead, but ended without a definite appointment.

No Appointments Booked: Despite a detailed and seemingly interested conversation, no bookings were achieved. This flags a critical area for improvement in call closing or conversion tactics.

Conversational Tone & Issues: Review of transcripts shows the AI is polite, informative, and patient, but sometimes lacks assertiveness in moving towards next steps (appointment or booking). Also, responses occasionally become repetitive, and transitions between data collection and pitching are sometimes abrupt.

Leads' Disposition: The main engaged lead was curious and forthcoming, though asked many logistical questions, and steered conversation towards company background over booking, indicating possible misalignment in focus.

No Human Transfer Cases: No explicit requests for human transfer were logged, but the lead started exploring company details—a phase where a human or specialist could potentially close better.

Recall/Follow-up: No automated recall or proactive post-call follow-up was evident.

3. Recommended Actions

1. Handling Objections
Example Call: (Long call, duration 479s)
Link: [Call Recording Example #2]
Transcript Excerpt:
HUMAN: "Me gustaría responder las preguntas del formulario por aquí."
BOT: "Claro, puedo ayudarte con eso. Comencemos. Primero, ¿cuál es tu nombre?"

Action:
When the lead expresses preference for a different communication channel or shows hesitation, the AI should reassure and provide seamless support:

Suggested Update:
"¡Por supuesto! Mi objetivo es facilitarte el proceso lo máximo posible. Puedes responder aquí o, si lo prefieres, puedo agendarte una llamada con un especialista para resolver cualquier inquietud."

2. Human Transfer Requests
Example Call: (Long call, duration 479s)
Link: [Call Recording Example #2]
Transcript Excerpt:
HUMAN: "¿Quién es Ivel Cepeda?"
BOT: "No manejo información específica sobre Ivel Cepeda. Si deseas, puedes contactar a nuestro equipo a través de WhatsApp..."

Action:
Proactively offer human transfer when a lead's questions fall outside AI scope, or when deep trust-building is required:

Suggested Update:
"Esa es una excelente pregunta. ¿Te gustaría que te ponga en contacto con uno de nuestros especialistas para información más detallada?"

3. Encouraging Engagement
Example Call: (Medium call, duration 42s)
Link: [Call Recording Example #1]
Transcript Excerpt:
BOT: "Hola, ¿cómo estás? Estoy aquí para ayudarte con lo que necesites. ¿Tienes algún proyecto en mente o alguna consulta sobre nuestros servicios?"
HUMAN: "Sí, deseo saber sobre los servicios que ustedes ofrecen."

Action:
If the conversation is becoming generic or stalling, prompt the prospect with value-driven statements or incentives:

Suggested Update:
"Muchos de nuestros clientes reciben una propuesta personalizada sin compromiso en menos de 24 horas. ¿Te gustaría que preparemos una para ti?"

4. Improving Topic Transitions
Example Call: (Long call, 479s, several abrupt transitions)
Link: [Call Recording Example #2]
Transcript Excerpt:
BOT: "Perfecto, sala y..."
HUMAN: "Dormitorios,"
BOT: "Genial, entonces tenemos sala, comedor y dormitorios. ¿Cuántos dormitorios hay en total?"

Action:
Add bridging statements to smoothen transitions between information gathering and value proposition:

Suggested Update:
"¡Gracias por la información! Ahora que entendemos tus necesidades, te puedo explicar cómo encajaría cada uno de nuestros paquetes en tu proyecto."

5. Better Initial Message
Issue: One call <20s—likely due to ineffective or too-brief opening.

Examples of Improved Initial Messages:
• "¡Hola! Habla [Nombre del Asistente Virtual] de Cepeda Design. ¿Está disponible un momento para una llamada rápida acerca de renovación y decoración?"
• "Muy buenas tardes, soy [Nombre], de Cepeda Design. ¿Es un buen momento para conversar sobre cómo transformar tus espacios?"
• "Hola, le llamo de Cepeda Design porque notamos su interés en mejorar su vivienda. ¿Le gustaría escuchar opciones personalizadas?"

6. Better Pitch
Issue: One call 20–50s with limited progression; pitch may need improvement.

Sample Pitch Upgrades:
• "Cepeda Design ofrece asesoría gratuita y propuestas a medida. ¿Le gustaría recibir un plan inicial sin compromiso?"
• "Nuestros expertos pueden transformar cualquier ambiente según sus gustos y presupuesto. ¿Cuál área le interesa renovar primero?"
• "Podemos ayudarte desde la selección de muebles hasta la ejecución completa. ¿Prefieres ideas remotas o visitas presenciales de un diseñador?"

4. Conclusion

The outreach campaign shows a promising start with a high connect rate and engaging conversations, but falls short in appointment setting and call optimization. Analysis reveals opportunities to improve the opening approach for short calls, upgrade the pitch to increase lead qualification on medium-length calls, and implement more effective closing or transfer strategies for extended engagements. Consistent, high-quality transitions and intentional encouragement to book appointments will be critical. Deploying proactive human transfer options and follow-up/recall sequences may further improve conversions. Implementing the above actionable changes should lead to increased appointment bookings, smoother call experiences, and a more robust, human-like AI interaction.

Next Steps:
• Update initial message and pitch per recommendations.
• Train the bot on objection-handling and engagement encouragement.
• Add scripted transitions to bridge data collection and solution proposal.
• Establish a trigger for human transfer or callback when needed.
• Monitor results and iterate based on conversion improvements.`;

  // Handle AI Summary Generation
  const handleRegenerateSummary = async () => {
    setIsGeneratingSummary(true);

    // Simulate AI generation with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setGeneratedSummary(summaryContent);
    setIsGeneratingSummary(false);
  };

  const handleSearch = () => {
    console.log("🔍 Aplicando filtros:", {
      from: fromDate,
      to: toDate,
      outcome,
      direction,
      campaign,
      contactName,
      contactNumberOrAgent,
      agentNameOrId,
      callDuration,
      clientId,
    });

    // Validar fechas
    if (fromDate && toDate) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      console.log("📅 Fechas procesadas:", {
        fromDate: fromDateObj.toISOString(),
        toDate: toDateObj.toISOString(),
        isValidFrom: !isNaN(fromDateObj.getTime()),
        isValidTo: !isNaN(toDateObj.getTime()),
      });
    }

    setApplyFilters(true);
    refetch();
  };

  const handleClearFilters = () => {
    setContactName("");
    setContactNumberOrAgent("");
    setCallDuration("");
    setOutcome("");
    setDirection("");
    setAgentNameOrId("");
    setCampaign("");
    setApplyFilters(false);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(selectedTranscript);
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "Answered":
        return "text-green-600";
      case "DNA":
        return "text-red-600";
      case "DNC":
        return "text-orange-600";
      case "Transfer":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getOutcomeText = (outcome: string) => {
    switch (outcome) {
      case "Exitoso":
        return "Answered";
      case "DNA":
        return "DNA";
      case "DNC":
        return "DNC";
      case "Transfer":
        return "Transfer";
      default:
        return outcome;
    }
  };

  const getDirectionText = (direction: string) => {
    switch (direction) {
      case "Saliente":
        return "Outbound";
      case "Entrante":
        return "Inbound";
      default:
        return direction;
    }
  };

  // Audio Player Functions
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      audioRef.current.currentTime = newTime;
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10,
      );
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "--:--";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <HomeIcon className="w-4 h-4 mr-1" />
        <span className="mr-2">Home</span>
        <span className="mr-2">›</span>
        <span className="text-gray-900">Call Logs & Recordings</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">
        Call Logs & Recordings
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Contact Number or Agent Number
            </label>
            <input
              type="text"
              value={contactNumberOrAgent}
              onChange={(e) => setContactNumberOrAgent(e.target.value)}
              placeholder="Contact Number or Agent Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Call Duration
            </label>
            <select
              value={callDuration}
              onChange={(e) => setCallDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Call Duration</option>
              <option value="shorter">Calls Shorter Than</option>
              <option value="longer">Calls Longer Than</option>
              <option value="between">Calls Between</option>
            </select>
          </div>

          {/* Row 2 */}
          <DatePicker
            value={fromDate}
            onChange={setFromDate}
            label="From"
            placeholder="09/01/2025"
          />
          <DatePicker
            value={toDate}
            onChange={setToDate}
            label="To"
            placeholder="10/01/2025"
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Outcome</option>
              <option value="all">All</option>
              <option value="dna">DNA</option>
              <option value="dnc">DNC</option>
              <option value="answered">Answered</option>
              <option value="transfer">Transfer</option>
              <option value="didnotconnect">Did not connect</option>
              <option value="scheduled">Scheduled appointment</option>
              <option value="qna">Q&A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Agent Name or Agent ID
            </label>
            <input
              type="text"
              value={agentNameOrId}
              onChange={(e) => setAgentNameOrId(e.target.value)}
              placeholder="Agent Name or Agent ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
            />
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Direction</option>
              <option value="all">All</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Campaign
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Campaign"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Summary
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium flex items-center">
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium flex items-center">
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export All
            </button>
            {selectedCalls.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={
                  deleteCallLog.isLoading || bulkDeleteCallLogs.isLoading
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium flex items-center"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Selected ({selectedCalls.size})
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {applyFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
                <span className="text-sm text-blue-700 font-medium">
                  Filtros activos:
                </span>
                <div className="ml-2 flex flex-wrap gap-2">
                  {contactName && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Contact: {contactName}
                    </span>
                  )}
                  {contactNumberOrAgent && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Number: {contactNumberOrAgent}
                    </span>
                  )}
                  {callDuration && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Duration: {callDuration}
                    </span>
                  )}
                  {outcome && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Outcome: {outcome}
                    </span>
                  )}
                  {direction && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Direction: {direction}
                    </span>
                  )}
                  {agentNameOrId && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Agent: {agentNameOrId}
                    </span>
                  )}
                  {campaign && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Campaign: {campaign}
                    </span>
                  )}
                  {fromDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      From: {fromDate}
                    </span>
                  )}
                  {toDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      To: {toDate}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setApplyFilters(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedCalls.size === conversations.length &&
                      conversations.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Contact Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Agent Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Contact Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Agent Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Recording
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Transcript
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Cargando conversaciones...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-8 text-center text-red-500"
                  >
                    Error al cargar conversaciones.{" "}
                    <button
                      onClick={() => refetch()}
                      className="text-blue-600 hover:underline"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {(callsData as any)?.error ? (
                      <div>
                        <p className="text-red-600 mb-2">
                          Error al cargar conversaciones:
                        </p>
                        <p className="text-sm">{(callsData as any)?.error}</p>
                        <button
                          onClick={() => refetch()}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : (
                      "No hay conversaciones disponibles"
                    )}
                  </td>
                </tr>
              ) : (
                conversations.map((conversation: any) => (
                  <tr
                    key={conversation.id}
                    className={`hover:bg-gray-50 ${
                      currentPlayingConversation === conversation.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCalls.has(conversation.id)}
                        onChange={() => handleSelectCall(conversation.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {conversation.contactName || "---"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {conversation.agentName || "---"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {conversation.contactNumber ||
                        conversation.agentId ||
                        "---"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {conversation.agentNumber ||
                        conversation.agentId ||
                        "---"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`flex items-center ${
                          conversation.callSuccessful === "success"
                            ? "text-green-600"
                            : conversation.callSuccessful === "failure"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                        {conversation.callSuccessful === "success"
                          ? "Answered"
                          : conversation.callSuccessful === "failure"
                            ? "DNA"
                            : "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {conversation.direction === "inbound"
                        ? "Inbound"
                        : "Outbound"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatISODate(conversation.startTime)}{" "}
                      {formatISOTime(conversation.startTime)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDuration(conversation.duration)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {conversation.hasAudio ||
                      conversation.elevenLabsConversationId ? (
                        <button
                          onClick={() => handlePlayRecording(conversation.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors ${
                            currentPlayingConversation === conversation.id
                              ? "bg-blue-600 text-white border border-blue-600"
                              : "text-blue-600 border border-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <PlayIcon className="w-3.5 h-3.5 mr-1" />
                          {currentPlayingConversation === conversation.id
                            ? "Playing"
                            : "Listen"}
                        </button>
                      ) : (
                        <span className="text-gray-400">---</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {conversation.transcript &&
                      conversation.transcript.length > 0 ? (
                        <button
                          onClick={() => handleViewTranscript(conversation.id)}
                          className="px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-xs font-medium flex items-center"
                        >
                          <DocumentTextIcon className="w-3.5 h-3.5 mr-1" />
                          Read
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No transcript
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReportIssue(conversation.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Report issue"
                        >
                          <FlagIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCall(conversation.id)}
                          disabled={deleteCallLog.isLoading}
                          className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          title="Delete conversation"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button
              className={`px-3 py-1 rounded text-sm flex items-center ${
                hasPreviousPage
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() =>
                hasPreviousPage && handlePageChange(currentPage - 1)
              }
              disabled={!hasPreviousPage}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
              {currentPage}
            </span>
            <button
              className={`px-3 py-1 rounded text-sm flex items-center ${
                hasNextPage
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => hasNextPage && handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
            <span className="text-sm text-gray-700">
              {totalCalls > 0
                ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalCalls)} of ${totalCalls}`
                : "0 of 0"}
            </span>
          </div>
        </div>

        {/* Audio Player */}
        <div className="px-6 py-6 border-t border-gray-200">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg px-12 py-6 mb-6">
            {currentPlayingConversation && (
              <div className="mb-4 text-center">
                <h4 className="text-sm font-medium text-gray-700">
                  Now Playing: Conversation #{currentPlayingConversation}
                </h4>
              </div>
            )}
            <div className="space-y-4">
              {/* Progress Bar Row */}
              <div className="flex items-center gap-4">
                {/* Time Display - Left */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    {formatTime(currentTime)}
                  </span>
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${duration ? (currentTime / duration) * 100 : 0}%, #BFDBFE ${duration ? (currentTime / duration) * 100 : 0}%, #BFDBFE 100%)`,
                    }}
                  />
                </div>

                {/* Time Display - Right */}
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-600">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-center gap-8">
                {/* Download Button */}
                <button
                  onClick={() => {
                    if (currentPlayingConversation) {
                      downloadAudio.mutate({
                        conversationId: currentPlayingConversation,
                        filename: `conversation-${currentPlayingConversation}.mp3`,
                      });
                    }
                  }}
                  disabled={
                    !currentPlayingConversation || downloadAudio.isPending
                  }
                  className={`px-5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    currentPlayingConversation && !downloadAudio.isPending
                      ? "bg-gray-300 text-gray-600 hover:bg-gray-400"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {downloadAudio.isPending ? "Descargando..." : "Download"}
                </button>

                {/* Playback Controls - Center */}
                <div className="flex items-center space-x-4">
                  {/* Backward Button */}
                  <button
                    onClick={skipBackward}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    aria-label="Skip backward"
                  >
                    <BackwardIcon className="w-6 h-6" />
                  </button>

                  {/* Play/Pause Button */}
                  <div className="relative group">
                    <button
                      onClick={togglePlayPause}
                      disabled={!audioUrl}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                        !audioUrl
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isPlaying
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      aria-label={
                        !audioUrl
                          ? "Selecciona un audio primero"
                          : isPlaying
                            ? "Pause"
                            : "Play"
                      }
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <PlayIconSolid className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    {/* Tooltip */}
                    {!audioUrl && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Selecciona un audio de la lista primero
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>

                  {/* Forward Button */}
                  <button
                    onClick={skipForward}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    aria-label="Skip forward"
                  >
                    <ForwardIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Volume Control - Right */}
                <div className="flex items-center space-x-2">
                  <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100}%, #BFDBFE ${volume * 100}%, #BFDBFE 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {isSummaryModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }}
          onClick={() => setIsSummaryModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Summary</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCustomPrompt(!customPrompt)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                      customPrompt ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                        customPrompt ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">Custom Prompt</span>
                  <InfoTooltip
                    content="Run a custom AI query on the calls you're currently viewing. Ask for specific moments, patterns, or improvements and get a made-to-order summary in seconds."
                    className="ml-0"
                  />
                </div>
                <button
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {customPrompt ? (
              <div className="space-y-4">
                <textarea
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="Find any calls where the prospect mentioned budget concerns and the AI failed to book, then give two objection-handling lines to test."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            ) : (
              <>
                {isGeneratingSummary ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg font-medium">
                      Generando resumen con IA...
                    </p>
                    <p className="text-gray-500 text-sm">
                      Analizando llamadas y generando insights...
                    </p>
                  </div>
                ) : generatedSummary ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {generatedSummary}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <StarIcon className="w-16 h-16 text-gray-300" />
                    <p className="text-gray-500 text-lg">
                      Haz clic en "Regenerate" para generar el resumen con IA
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              {customPrompt ? (
                <>
                  <button
                    onClick={handleRegenerateSummary}
                    disabled={isGeneratingSummary || !customPromptText.trim()}
                    className={`px-6 py-2.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium ${
                      isGeneratingSummary || !customPromptText.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-300"
                    }`}
                  >
                    {isGeneratingSummary ? "Generating..." : "Generate"}
                  </button>
                  <button
                    onClick={() => setIsSummaryModalOpen(false)}
                    disabled={isGeneratingSummary}
                    className={`px-6 py-2.5 bg-white border border-red-500 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium ${
                      isGeneratingSummary ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRegenerateSummary}
                    disabled={isGeneratingSummary}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center ${
                      isGeneratingSummary ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isGeneratingSummary && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {isGeneratingSummary ? "Generando..." : "Regenerate"}
                  </button>
                  <button
                    onClick={() => setIsSummaryModalOpen(false)}
                    disabled={isGeneratingSummary}
                    className={`px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium ${
                      isGeneratingSummary ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {isTranscriptModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }}
          onClick={() => setIsTranscriptModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Transcript</h2>
              <button
                onClick={() => setIsTranscriptModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {selectedTranscriptDate}
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {selectedTranscript}
              </pre>
            </div>

            <button
              onClick={handleCopyTranscript}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Conversation Transcript Modal */}
      {showTranscript && selectedCall && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }}
          onClick={() => {
            setShowTranscript(false);
            setSelectedConversationId(null);
            setFeedbackSent(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Transcripción de Llamada #{selectedCall.id}
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopyConversation}
                  data-copy-button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span>Copiar Conversación</span>
                </button>
                <button
                  onClick={() => {
                    setShowTranscript(false);
                    setSelectedConversationId(null);
                    setFeedbackSent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Información de la conversación */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Agente</div>
                <div className="font-medium">{selectedCall.agentName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estado</div>
                <div className="font-medium capitalize">
                  {selectedCall.status}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fecha</div>
                <div className="font-medium">
                  {formatISODate(selectedCall.startTime)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Duración</div>
                <div className="font-medium">
                  {formatDuration(selectedCall.duration)}
                </div>
              </div>
            </div>

            {/* Información adicional de la llamada */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información de la Llamada
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Número de Contacto
                  </div>
                  <div className="font-medium">
                    {selectedCall.contactNumber}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Dirección</div>
                  <div className="font-medium capitalize">
                    {selectedCall.direction}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Resultado</div>
                  <div className="font-medium capitalize">
                    {selectedCall.callSuccessful}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Longitud de Transcripción
                  </div>
                  <div className="font-medium">
                    {selectedCall.transcriptLength || 0} caracteres
                  </div>
                </div>
              </div>
            </div>

            {/* Transcripción */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transcripción
                </h3>
                {selectedCall.transcript &&
                  selectedCall.transcript.length > 2000 && (
                    <button
                      onClick={handleTranscriptToggle}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {transcriptExpanded ? "Ver menos" : "Ver más"}
                    </button>
                  )}
              </div>

              <div
                className={`overflow-y-auto ${
                  transcriptExpanded ? "max-h-none" : "max-h-96"
                }`}
              >
                {selectedCall.transcript &&
                selectedCall.transcript.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {transcriptExpanded
                        ? selectedCall.transcript
                        : selectedCall.transcript.length > 2000
                          ? selectedCall.transcript.substring(0, 2000) + "..."
                          : selectedCall.transcript}
                    </div>
                    {!transcriptExpanded &&
                      selectedCall.transcript.length > 2000 && (
                        <div className="text-center mt-4">
                          <div className="text-sm text-gray-500 mb-2">
                            Mostrando {2000} de {selectedCall.transcript.length}{" "}
                            caracteres
                          </div>
                          <button
                            onClick={handleTranscriptToggle}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver transcripción completa
                          </button>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No hay transcripción disponible para esta llamada.
                  </p>
                )}
              </div>
            </div>

            {/* Sistema de feedback */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={handleCopyConversation}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  <span>Copiar Transcripción</span>
                </button>

                {selectedCall.elevenLabsConversationId && (
                  <button
                    onClick={() => handlePlayRecording(selectedCall.id)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Reproducir Audio</span>
                  </button>
                )}
              </div>

              {sendFeedback.isPending && (
                <div className="mt-4 text-sm text-gray-600">
                  Enviando feedback...
                </div>
              )}

              {feedbackSent && !sendFeedback.isPending && (
                <div className="mt-4 text-sm text-green-600">
                  ¡Gracias por tu feedback! Tu evaluación nos ayuda a mejorar
                  nuestros agentes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isReportIssueModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }}
          onClick={() => {
            setIsReportIssueModalOpen(false);
            setReportIssueDescription("");
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Issue
            </h3>

            <textarea
              value={reportIssueDescription}
              onChange={(e) => setReportIssueDescription(e.target.value)}
              placeholder="Describe Issue..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder-gray-400"
            />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsReportIssueModalOpen(false);
                  setReportIssueDescription("");
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportIssueDescription.trim()}
                className={`px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium ${
                  !reportIssueDescription.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-300"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }}
          onClick={() => {
            setShowReportModal(false);
            setReportDescription("");
            setReportingConversationId(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Report Issue
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDescription("");
                  setReportingConversationId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Describe the problem or error that occurred during this
              conversation:
            </p>

            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Ex: The agent didn't understand the client's question, there were audio problems, the agent provided incorrect information, etc."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder-gray-400"
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDescription("");
                  setReportingConversationId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportDescription.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }}
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {deleteTarget.type === "single"
                    ? "Eliminar Conversación"
                    : "Eliminar Conversaciones"}
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {deleteTarget.type === "single"
                  ? "¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer."
                  : `¿Estás seguro de que quieres eliminar ${deleteTarget.callIds?.length || 0} conversaciones? Esta acción no se puede deshacer.`}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                disabled={
                  deleteCallLog.isLoading || bulkDeleteCallLogs.isLoading
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={
                  deleteCallLog.isLoading || bulkDeleteCallLogs.isLoading
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium flex items-center"
              >
                {(deleteCallLog.isLoading || bulkDeleteCallLogs.isLoading) && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {deleteTarget.type === "single" ? "Eliminar" : "Eliminar Todas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      {audioUrl && (
        <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />
      )}
    </div>
  );
};

export default CallLogs;
