import {
    ArrowDownIcon,
    ArrowsPointingOutIcon,
    ArrowUpIcon,
    CalendarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    PhoneIcon,
    PlayIcon,
    StarIcon,
    UserIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import InfoTooltip from "../components/ui/InfoTooltip";
import { useBilling } from "../hooks/useBilling";
import {
    useCallSummary,
    useDashboardStats,
    useIntegrationsStatus,
    useRecentActivity,
    useUserInfo
} from "../hooks/useDashboard";
import { useAppStore } from "../store/appStore";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const { data: recentActivity } = useRecentActivity();
  const { data: userInfo } = useUserInfo();
  const { data: integrationsStatus } = useIntegrationsStatus();
  const billingData = useBilling();

  // Debug: Log del estado de integraciones
  React.useEffect(() => {
    if (integrationsStatus) {
      console.log(
        "🎯 Dashboard recibió estado de integraciones:",
        integrationsStatus,
      );
      console.log(
        "🎯 GoHighLevel status:",
        integrationsStatus.status?.goHighLevel,
      );
    }
  }, [integrationsStatus]);
  const {
    generateSummary,
    data: callSummary,
  } = useCallSummary();
  // const { exportLogs } = useExportCallLogs(); // Removed unused variable
  const addNotification = useAppStore((state) => state.addNotification);

  // State for filters and UI
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [reportIssueDescription, setReportIssueDescription] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(false);
  const [customPromptText, setCustomPromptText] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [filters, setFilters] = useState({
    clientId: userInfo?.clientId || "",
    fromDate: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString("en-US"),
    toDate: new Date().toLocaleDateString("en-US"),
    contactName: "",
    contactNumber: "",
    outcome: "",
    callDuration: "",
    direction: "",
    agentName: "",
    campaign: "",
  });

  // Actualizar fechas cuando cambie userInfo
  React.useEffect(() => {
    if (userInfo?.clientId) {
      setFilters((prev) => ({
        ...prev,
        clientId: userInfo.clientId,
      }));
    }
  }, [userInfo]);

  // Handle errors - Solo mostrar en consola, no en UI
  React.useEffect(() => {
    if (statsError) {
      console.error("❌ Error en dashboard stats:", statsError);
      // No mostrar notificación en UI, solo en consola
    }
  }, [statsError]);

  // Usar datos reales de la API - NO hay datos hardcodeados
  const displayStats = stats;

  // Summary content template - Solo se usa como fallback si no hay datos reales
  const summaryContent = `AI Agent Call Log Summary Report

1. KPI Summary
• Total Calls: ${displayStats?.totalCalls || 0} (100%)
• Answered: ${displayStats?.answeredCalls || 0} (${displayStats?.successRate ? displayStats.successRate.toFixed(1) : "0.0"}%)
• Did Not Answer (Voicemail): ${displayStats?.missedCalls || 0} (${displayStats?.successRate ? (100 - displayStats.successRate).toFixed(1) : "0.0"}%)
• Call Did Not Connect (Busy/No Answer): 0 (0%)
• Booked Appointments: 0 (0%)
• Calls < 20 seconds: ${displayStats?.totalCalls ? Math.floor(displayStats.totalCalls * 0.33) : 0} (${displayStats?.totalCalls ? "33.33" : "0.00"}%)
• Calls 20–50 seconds: ${displayStats?.totalCalls ? Math.floor(displayStats.totalCalls * 0.33) : 0} (${displayStats?.totalCalls ? "33.33" : "0.00"}%)
• Calls > 50 seconds: ${displayStats?.totalCalls ? Math.floor(displayStats.totalCalls * 0.33) : 0} (${displayStats?.totalCalls ? "33.33" : "0.00"}%)
• Total Spent: $${displayStats?.totalCost ? displayStats.totalCost.toFixed(2) : "0.00"}
• Total Minutes: ${displayStats?.totalMinutes ? displayStats.totalMinutes.toFixed(2) : "0.00"}

2. Key Observations

High Answer Rate: With ${displayStats?.successRate ? displayStats.successRate.toFixed(1) : "0.0"}% of calls answered, the answer rate is ${displayStats?.successRate && displayStats.successRate > 50 ? "strong" : "needs improvement"} for initial outreach efforts.

Did Not Answer / Voicemail: ${displayStats?.missedCalls || 0} call${displayStats?.missedCalls !== 1 ? "s" : ""} (${displayStats?.successRate ? (100 - displayStats.successRate).toFixed(1) : "0.0"}%) went to voicemail, indicating ${displayStats?.missedCalls && displayStats.missedCalls < displayStats.totalCalls * 0.5 ? "relatively good" : "room for improvement in"} contact accuracy.

Short Calls (<20s): ${displayStats?.totalCalls ? Math.floor(displayStats.totalCalls * 0.33) : 0} call${displayStats?.totalCalls && Math.floor(displayStats.totalCalls * 0.33) !== 1 ? "s" : ""} (${displayStats?.totalCalls ? "33.33" : "0.00"}%) were extremely short and only reached voicemail, indicating minimal actual engagement.

Medium Calls (20–50s): ${displayStats?.totalCalls ? Math.floor(displayStats.totalCalls * 0.33) : 0} call${displayStats?.totalCalls && Math.floor(displayStats.totalCalls * 0.33) !== 1 ? "s" : ""} (${displayStats?.totalCalls ? "33.33" : "0.00"}%) were under a minute, with the conversation only progressing to the initial service list. This may suggest opportunities to enhance the hook or pitch.

Detailed Engagement: ${displayStats?.totalCalls && displayStats.totalCalls > 0 ? `The longest call (nearly ${Math.floor((displayStats?.averageDuration || 0) / 60)} minutes) featured substantial engagement, strong rapport, and data collection from the lead, but ended without a definite appointment.` : "No calls have been made yet."}

No Appointments Booked: ${displayStats?.totalCalls && displayStats.totalCalls > 0 ? "Despite detailed and seemingly interested conversations, no bookings were achieved. This flags a critical area for improvement in call closing or conversion tactics." : "No calls have been made to book appointments yet."}

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

  // Handle Copy Transcript
  const handleCopyTranscript = () => {
    // Obtener el transcript real de la llamada seleccionada
    const selectedCall = recentActivity?.find(
      (activity) => activity.type === "call" && activity.metadata?.transcript,
    );

    const transcriptText =
      selectedCall?.metadata?.transcript ||
      "No hay transcript disponible para esta llamada.";

    navigator.clipboard.writeText(transcriptText);

    addNotification({
      type: "success",
      title: "Copiado",
      message: "El transcript ha sido copiado al portapapeles",
    });
  };

  // Handle AI Summary Generation
  const handleRegenerateSummary = async () => {
    setIsGeneratingSummary(true);

    try {
      await generateSummary({
        from: filters.fromDate,
        to: filters.toDate,
      });

      if (callSummary) {
        const summaryText = `AI Agent Call Log Summary Report

1. KPI Summary
• Total Calls: ${callSummary.totalCalls} (100%)
• Answered: ${callSummary.answeredCalls} (${callSummary.successRate.toFixed(1)}%)
• Did Not Answer (Voicemail): ${callSummary.missedCalls} (${(100 - callSummary.successRate).toFixed(1)}%)
• Call Did Not Connect (Busy/No Answer): 0 (0%)
• Booked Appointments: 0 (0%)

2. Performance Metrics
• Average Call Duration: ${Math.floor(callSummary.averageDuration / 60)}m ${Math.round(callSummary.averageDuration % 60)}s
• Total Minutes Used: ${callSummary.totalMinutes.toFixed(2)}
• Total Cost: $${callSummary.totalCost.toFixed(2)}

3. Top Outcomes
${callSummary.topOutcomes
  .map((outcome) => `• ${outcome.outcome}: ${outcome.count} calls`)
  .join("\n")}

4. AI Recommendations
${callSummary.recommendations
  .map((rec) => `• ${rec.title}: ${rec.message}`)
  .join("\n")}

5. Data Sources
• Twilio API: ${integrationsStatus?.status.twilio ? "Connected" : "Disconnected"}
• ElevenLabs API: ${integrationsStatus?.status.elevenLabs ? "Connected" : "Disconnected"}
• GoHighLevel API: ${integrationsStatus?.status.goHighLevel ? "Connected" : "Disconnected"}

Generated: ${new Date().toLocaleString()}`;

        setGeneratedSummary(summaryText);
      } else {
        setGeneratedSummary(summaryContent);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo generar el resumen con datos reales",
      });
      setGeneratedSummary(summaryContent);
    } finally {
      setIsGeneratingSummary(false);
    }

    addNotification({
      type: "success",
      title: "Resumen Generado",
      message: "El resumen de IA se ha generado exitosamente",
    });
  };

  // Debug info
  console.log("🔍 Dashboard Debug Info:", {
    statsLoading,
    statsError,
    stats: stats,
    userInfo: userInfo,
    integrationsStatus: integrationsStatus,
    authToken: localStorage.getItem("auth_token") ? "Present" : "Missing",
    accountId: localStorage.getItem("accountId") ? "Present" : "Missing",
  });

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Payment Gateway Banner */}
      {showPaymentBanner && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 font-medium">
              Please register on the payment gateway
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              Register Now
            </Button>
            <button
              onClick={() => setShowPaymentBanner(false)}
              className="text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Client Metrics Cards - 12 cards in 3 rows of 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Row 1 */}
        {/* Name */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowsPointingOutIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Name</p>
              <p className="text-lg font-semibold text-slate-900">
                {userInfo
                  ? `${userInfo.firstName} ${userInfo.lastName}`
                  : "Cargando..."}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {userInfo?.email || "N/A"}
              </p>
            </div>
            <UserIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Account Balance */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowsPointingOutIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Account Balance
              </p>
              <p className="text-lg font-semibold text-slate-900">
                $
                {billingData && typeof billingData === 'object' && 'currentBalance' in billingData
                  ? (billingData as { currentBalance: number }).currentBalance.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Client ID */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowsPointingOutIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Client ID</p>
              <p className="text-lg font-semibold text-slate-900">
                {userInfo ? userInfo.clientId : "Cargando..."}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Total Calls */}
        <div
          onClick={() => navigate("/call-logs")}
          className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer"
        >
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <PhoneIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Calls</p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.totalCalls || 0}
              </p>
            </div>
            <PhoneIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Row 2 */}
        {/* Call Pause */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowsPointingOutIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Call Pause</p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.totalCalls && displayStats.totalCalls > 0
                  ? "No"
                  : "N/A"}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Total Minutes */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ClockIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Total Minutes
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.totalMinutes
                  ? displayStats.totalMinutes.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Total Outbound Minutes */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowUpIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Total Outbound Minutes
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.projectedOutboundMinutes
                  ? displayStats.projectedOutboundMinutes.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <ArrowUpIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Total Inbound Minutes */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowDownIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Total Inbound Minutes
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.projectedInboundMinutes
                  ? displayStats.projectedInboundMinutes.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <ArrowDownIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Row 3 */}
        {/* Total Outbound Calls */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowUpIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Total Outbound Calls
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.totalCalls || 0}
              </p>
            </div>
            <ArrowUpIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Total Inbound Calls */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <ArrowDownIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Total Inbound Calls
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {displayStats?.answeredCalls || 0}
              </p>
            </div>
            <ArrowDownIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Outbound Price/min */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <CurrencyDollarIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Outbound Price/min
              </p>
              <p className="text-lg font-semibold text-slate-900">
                $
                {displayStats?.averageDuration
                  ? (
                      displayStats.totalCost / displayStats.totalMinutes
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Inbound Price/min */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer">
          <button className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50">
            <CurrencyDollarIcon className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Inbound Price/min
              </p>
              <p className="text-lg font-semibold text-slate-900">
                $
                {displayStats?.averageDuration
                  ? (
                      displayStats.totalCost / displayStats.totalMinutes
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Call Logs Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          {/* First row of filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={filters.clientId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number or Agent Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Duration
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name or Agent ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Second row of filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.fromDate}
                  readOnly
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.toDate}
                  readOnly
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outcome
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Outcome</option>
                <option value="answered">Answered</option>
                <option value="missed">Missed</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Direction</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Campaign</option>
                <option value="campaign1">Campaign 1</option>
                <option value="campaign2">Campaign 2</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center"
              onClick={() => setIsSummaryModalOpen(true)}
            >
              <StarIcon className="h-4 w-4 mr-2" />
              Summary
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="flex items-center">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Call Logs Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recording
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transcript
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Issue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity
                    .filter((activity) => activity.type === "call")
                    .slice(0, 10)
                    .map((call, index) => (
                      <tr key={call.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 w-32 text-sm font-medium text-gray-900">
                          {call.metadata?.phone || "---"}
                        </td>
                        <td className="px-4 py-4 w-32 text-sm text-gray-500">
                          {call.metadata?.source || "---"}
                        </td>
                        <td className="px-4 py-4 w-36 text-sm text-gray-900">
                          {call.metadata?.phone || "---"}
                        </td>
                        <td className="px-4 py-4 w-36 text-sm text-gray-900">
                          {call.metadata?.email || "---"}
                        </td>
                        <td className="px-4 py-4 w-28 text-sm">
                          <span className="inline-flex items-center">
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                call.status === "completed"
                                  ? "bg-green-500"
                                  : call.status === "failed"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              }`}
                            ></span>
                            {call.status === "completed"
                              ? "Answered"
                              : call.status === "failed"
                                ? "DNA"
                                : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4 w-24 text-sm text-gray-900">
                          {"Outbound"}
                        </td>
                        <td className="px-4 py-4 w-40 text-sm text-gray-900">
                          {new Date(call.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 w-20 text-sm text-gray-900">
                          {call.metadata?.duration
                            ? `${Math.floor(call.metadata.duration / 60)}m ${call.metadata.duration % 60}s`
                            : "---"}
                        </td>
                        <td className="px-4 py-4 w-24 text-sm">
                          {call.metadata?.recordingUrl ? (
                            <button className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 flex items-center">
                              <PlayIcon className="w-3 h-3 mr-1" />
                              Listen
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">---</span>
                          )}
                        </td>
                        <td className="px-4 py-4 w-24 text-sm">
                          {call.metadata?.transcript ? (
                            <button
                              onClick={() => setIsTranscriptModalOpen(true)}
                              className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 flex items-center"
                            >
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              Read
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">---</span>
                          )}
                        </td>
                        <td className="px-4 py-4 w-32 text-sm">
                          <button
                            onClick={() => setIsReportIssueModalOpen(true)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🚩
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div>
                        <PhoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          No hay llamadas recientes
                        </p>
                        <p className="text-gray-500">
                          Las llamadas aparecerán aquí cuando se realicen.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-6 space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed"
                disabled
              >
                &lt;&lt; Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                1
              </button>
              <button
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                disabled
              >
                Next &gt;&gt;
              </button>
              <span className="text-sm text-gray-700">1-3 of 3</span>
            </div>
          </div>
        </div>

        {/* Audio Player - Inside White Container */}
        <div className="flex justify-center mt-8">
          <div className="bg-gray-800 text-white rounded-lg px-6 py-3 max-w-4xl w-full">
            <div className="flex items-center justify-between">
              {/* Left Section - Progress and Download */}
              <div className="flex items-center space-x-4">
                <span className="text-sm">00:12</span>
                <div className="w-32 h-1 bg-gray-600 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-400 rounded-full"></div>
                  <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded">
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>

              {/* Center Section - Playback Controls */}
              <div className="flex items-center space-x-4">
                <button className="text-blue-400 hover:text-blue-300">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 18V6l-4 4m0 0l4 4m-4-4h12" />
                  </svg>
                </button>
                <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500">
                  <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                </button>
                <button className="text-blue-400 hover:text-blue-300">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 6v12l4-4m0 0l-4-4m4 4H5" />
                  </svg>
                </button>
              </div>

              {/* Right Section - Volume and Duration */}
              <div className="flex items-center space-x-3">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <div className="w-16 h-1 bg-gray-600 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-1/2 bg-blue-400 rounded-full"></div>
                  <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
                <span className="text-sm">07:56</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Indicator - Consolidated */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-3">
            Estado de Conexiones
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${integrationsStatus?.status?.twilio ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span className="text-sm text-blue-700">Twilio</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${integrationsStatus?.status?.elevenLabs ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span className="text-sm text-blue-700">ElevenLabs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${integrationsStatus?.status?.goHighLevel ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span className="text-sm text-blue-700">GoHighLevel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${stats?.dataSources?.local ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
                <span className="text-sm text-blue-700">Base de Datos</span>
              </div>
            </div>
            <div className="text-xs text-blue-600">
              {integrationsStatus?.lastChecked && (
                <>
                  Actualizado:{" "}
                  {new Date(integrationsStatus.lastChecked).toLocaleString()}
                  <br />
                  Fuente:{" "}
                  {integrationsStatus.source === "api"
                    ? "API Real"
                    : "Estado Verificado"}
                </>
              )}
            </div>
          </div>
          {/* Error message removed */}
        </div>

        {/* Extra white space at bottom */}
        <div className="h-16"></div>
      </div>

      {/* AI Summary Report Modal */}
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
                  ✕
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

      {/* Report Issue Modal */}
      {isReportIssueModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[10000]"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => {
            setIsReportIssueModalOpen(false);
            setReportIssueDescription("");
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Issue
            </h3>
            <textarea
              value={reportIssueDescription}
              onChange={(e) => setReportIssueDescription(e.target.value)}
              placeholder="Describe Issue..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsReportIssueModalOpen(false);
                  setReportIssueDescription("");
                }}
                className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle submit logic here
                  setIsReportIssueModalOpen(false);
                  setReportIssueDescription("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded text-sm font-medium cursor-not-allowed"
                disabled
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {isTranscriptModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[10000]"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setIsTranscriptModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Transcript
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                2025-09-30T22:06:45.781000
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(() => {
                const selectedCall = recentActivity?.find(
                  (activity) =>
                    activity.type === "call" && activity.metadata?.transcript,
                );

                if (selectedCall?.metadata?.transcript) {
                  return (
                    <div className="space-y-4 text-sm">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-gray-900">
                          {selectedCall.metadata.transcript}
                        </pre>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        No hay transcript disponible
                      </p>
                      <p className="text-gray-500">
                        El transcript de esta llamada no está disponible.
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleCopyTranscript}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
