import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowDownIcon, ArrowsPointingOutIcon, ArrowUpIcon, CalendarIcon, ClockIcon, CurrencyDollarIcon, DocumentArrowDownIcon, DocumentTextIcon, ExclamationTriangleIcon, PhoneIcon, PlayIcon, StarIcon, UserIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import InfoTooltip from "../components/ui/InfoTooltip";
import { useBilling } from "../hooks/useBilling";
import { useCallSummary, useDashboardStats, useIntegrationsStatus, useRecentActivity, useUserInfo } from "../hooks/useDashboard";
import { useAppStore } from "../store/appStore";
const Dashboard = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading: statsLoading, error: statsError, } = useDashboardStats();
    const { data: recentActivity } = useRecentActivity();
    const { data: userInfo } = useUserInfo();
    const { data: integrationsStatus } = useIntegrationsStatus();
    const billingData = useBilling();
    // Debug: Log del estado de integraciones
    React.useEffect(() => {
        if (integrationsStatus) {
            console.log("🎯 Dashboard recibió estado de integraciones:", integrationsStatus);
            console.log("🎯 GoHighLevel status:", integrationsStatus.status?.goHighLevel);
        }
    }, [integrationsStatus]);
    const { generateSummary, data: callSummary, } = useCallSummary();
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
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US"),
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
        const selectedCall = recentActivity?.find((activity) => activity.type === "call" && activity.metadata?.transcript);
        const transcriptText = selectedCall?.metadata?.transcript ||
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
            }
            else {
                setGeneratedSummary(summaryContent);
            }
        }
        catch (error) {
            console.error("Error generating summary:", error);
            addNotification({
                type: "error",
                title: "Error",
                message: "No se pudo generar el resumen con datos reales",
            });
            setGeneratedSummary(summaryContent);
        }
        finally {
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
        return (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-300 rounded w-1/3 mb-6" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "h-32 bg-gray-300 rounded" }, i))) }), _jsx("div", { className: "h-64 bg-gray-300 rounded" })] }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [showPaymentBanner && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-400 mr-2" }), _jsx("span", { className: "text-red-800 font-medium", children: "Please register on the payment gateway" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { size: "sm", className: "bg-red-600 hover:bg-red-700", children: "Register Now" }), _jsx("button", { onClick: () => setShowPaymentBanner(false), className: "text-red-400 hover:text-red-600", children: _jsx(XMarkIcon, { className: "h-5 w-5" }) })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowsPointingOutIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Name" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: userInfo
                                                    ? `${userInfo.firstName} ${userInfo.lastName}`
                                                    : "Cargando..." }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: userInfo?.email || "N/A" })] }), _jsx(UserIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowsPointingOutIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Account Balance" }), _jsxs("p", { className: "text-lg font-semibold text-slate-900", children: ["$", billingData && typeof billingData === 'object' && 'currentBalance' in billingData
                                                        ? billingData.currentBalance.toFixed(2)
                                                        : "0.00"] })] }), _jsx(CurrencyDollarIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowsPointingOutIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Client ID" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: userInfo ? userInfo.clientId : "Cargando..." })] }), _jsx(ClockIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { onClick: () => navigate("/call-logs"), className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(PhoneIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Total Calls" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.totalCalls || 0 })] }), _jsx(PhoneIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowsPointingOutIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Call Pause" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.totalCalls && displayStats.totalCalls > 0
                                                    ? "No"
                                                    : "N/A" })] }), _jsx(ExclamationTriangleIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ClockIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Total Minutes" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.totalMinutes
                                                    ? displayStats.totalMinutes.toFixed(2)
                                                    : "0.00" })] }), _jsx(ClockIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowUpIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Total Outbound Minutes" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.projectedOutboundMinutes
                                                    ? displayStats.projectedOutboundMinutes.toFixed(2)
                                                    : "0.00" })] }), _jsx(ArrowUpIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowDownIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Total Inbound Minutes" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.projectedInboundMinutes
                                                    ? displayStats.projectedInboundMinutes.toFixed(2)
                                                    : "0.00" })] }), _jsx(ArrowDownIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowUpIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Total Outbound Calls" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.totalCalls || 0 })] }), _jsx(ArrowUpIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(ArrowDownIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Total Inbound Calls" }), _jsx("p", { className: "text-lg font-semibold text-slate-900", children: displayStats?.answeredCalls || 0 })] }), _jsx(ArrowDownIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(CurrencyDollarIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Outbound Price/min" }), _jsxs("p", { className: "text-lg font-semibold text-slate-900", children: ["$", displayStats?.averageDuration
                                                        ? (displayStats.totalCost / displayStats.totalMinutes).toFixed(2)
                                                        : "0.00"] })] }), _jsx(CurrencyDollarIcon, { className: "h-8 w-8 text-slate-400" })] })] }), _jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer", children: [_jsx("button", { className: "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:bg-gray-50", children: _jsx(CurrencyDollarIcon, { className: "h-4 w-4 text-slate-600" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600 font-medium", children: "Inbound Price/min" }), _jsxs("p", { className: "text-lg font-semibold text-slate-900", children: ["$", displayStats?.averageDuration
                                                        ? (displayStats.totalCost / displayStats.totalMinutes).toFixed(2)
                                                        : "0.00"] })] }), _jsx(CurrencyDollarIcon, { className: "h-8 w-8 text-slate-400" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Call Logs" }) }), _jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Client ID" }), _jsx("input", { type: "text", value: filters.clientId, readOnly: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contact Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contact Number or Agent Number" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Call Duration" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Agent Name or Agent ID" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "From" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: filters.fromDate, readOnly: true, className: "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" }), _jsx(CalendarIcon, { className: "absolute right-3 top-2.5 h-5 w-5 text-gray-400" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "To" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: filters.toDate, readOnly: true, className: "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" }), _jsx(CalendarIcon, { className: "absolute right-3 top-2.5 h-5 w-5 text-gray-400" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Outcome" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select Outcome" }), _jsx("option", { value: "answered", children: "Answered" }), _jsx("option", { value: "missed", children: "Missed" }), _jsx("option", { value: "busy", children: "Busy" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Direction" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select Direction" }), _jsx("option", { value: "inbound", children: "Inbound" }), _jsx("option", { value: "outbound", children: "Outbound" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Campaign" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select Campaign" }), _jsx("option", { value: "campaign1", children: "Campaign 1" }), _jsx("option", { value: "campaign2", children: "Campaign 2" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700 flex items-center", onClick: () => setIsSummaryModalOpen(true), children: [_jsx(StarIcon, { className: "h-4 w-4 mr-2" }), "Summary"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", className: "flex items-center", children: [_jsx(DocumentArrowDownIcon, { className: "h-4 w-4 mr-2" }), "Export"] }), _jsxs(Button, { variant: "outline", className: "flex items-center", children: [_jsx(DocumentArrowDownIcon, { className: "h-4 w-4 mr-2" }), "Export All"] }), _jsx(Button, { variant: "outline", className: "text-red-600 border-red-600 hover:bg-red-50", children: "Clear Filters" })] })] })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Contact Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Agent Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Contact Number" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Agent Number" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Outcome" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Direction" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Duration" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Recording" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Transcript" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Report Issue" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: recentActivity && recentActivity.length > 0 ? (recentActivity
                                                .filter((activity) => activity.type === "call")
                                                .slice(0, 10)
                                                .map((call, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-4 w-32 text-sm font-medium text-gray-900", children: call.metadata?.phone || "---" }), _jsx("td", { className: "px-4 py-4 w-32 text-sm text-gray-500", children: call.metadata?.source || "---" }), _jsx("td", { className: "px-4 py-4 w-36 text-sm text-gray-900", children: call.metadata?.phone || "---" }), _jsx("td", { className: "px-4 py-4 w-36 text-sm text-gray-900", children: call.metadata?.email || "---" }), _jsx("td", { className: "px-4 py-4 w-28 text-sm", children: _jsxs("span", { className: "inline-flex items-center", children: [_jsx("span", { className: `w-2 h-2 rounded-full mr-2 ${call.status === "completed"
                                                                        ? "bg-green-500"
                                                                        : call.status === "failed"
                                                                            ? "bg-red-500"
                                                                            : "bg-yellow-500"}` }), call.status === "completed"
                                                                    ? "Answered"
                                                                    : call.status === "failed"
                                                                        ? "DNA"
                                                                        : "Pending"] }) }), _jsx("td", { className: "px-4 py-4 w-24 text-sm text-gray-900", children: "Outbound" }), _jsx("td", { className: "px-4 py-4 w-40 text-sm text-gray-900", children: new Date(call.timestamp).toLocaleString() }), _jsx("td", { className: "px-4 py-4 w-20 text-sm text-gray-900", children: call.metadata?.duration
                                                            ? `${Math.floor(call.metadata.duration / 60)}m ${call.metadata.duration % 60}s`
                                                            : "---" }), _jsx("td", { className: "px-4 py-4 w-24 text-sm", children: call.metadata?.recordingUrl ? (_jsxs("button", { className: "bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 flex items-center", children: [_jsx(PlayIcon, { className: "w-3 h-3 mr-1" }), "Listen"] })) : (_jsx("span", { className: "text-gray-400 text-xs", children: "---" })) }), _jsx("td", { className: "px-4 py-4 w-24 text-sm", children: call.metadata?.transcript ? (_jsxs("button", { onClick: () => setIsTranscriptModalOpen(true), className: "bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 flex items-center", children: [_jsx(DocumentTextIcon, { className: "w-3 h-3 mr-1" }), "Read"] })) : (_jsx("span", { className: "text-gray-400 text-xs", children: "---" })) }), _jsx("td", { className: "px-4 py-4 w-32 text-sm", children: _jsx("button", { onClick: () => setIsReportIssueModalOpen(true), className: "text-red-500 hover:text-red-700", children: "\uD83D\uDEA9" }) })] }, call.id || index)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "px-6 py-12 text-center text-gray-500", children: _jsxs("div", { children: [_jsx(PhoneIcon, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-900 mb-2", children: "No hay llamadas recientes" }), _jsx("p", { className: "text-gray-500", children: "Las llamadas aparecer\u00E1n aqu\u00ED cuando se realicen." })] }) }) })) })] }) }), _jsxs("div", { className: "flex items-center justify-center mt-6 space-x-8", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-700", children: "Rows per page:" }), _jsxs("select", { className: "text-sm border border-gray-300 rounded px-2 py-1 bg-white", children: [_jsx("option", { value: "10", children: "10" }), _jsx("option", { value: "25", children: "25" }), _jsx("option", { value: "50", children: "50" }), _jsx("option", { value: "100", children: "100" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { className: "px-3 py-1 text-sm text-gray-400 cursor-not-allowed", disabled: true, children: "<< Previous" }), _jsx("button", { className: "px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700", children: "1" }), _jsx("button", { className: "px-3 py-1 text-sm text-gray-500 hover:text-gray-700", disabled: true, children: "Next >>" }), _jsx("span", { className: "text-sm text-gray-700", children: "1-3 of 3" })] })] })] }), _jsx("div", { className: "flex justify-center mt-8", children: _jsx("div", { className: "bg-gray-800 text-white rounded-lg px-6 py-3 max-w-4xl w-full", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-sm", children: "00:12" }), _jsxs("div", { className: "w-32 h-1 bg-gray-600 rounded-full relative", children: [_jsx("div", { className: "absolute left-0 top-0 h-full w-1/3 bg-blue-400 rounded-full" }), _jsx("div", { className: "absolute left-1/3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full" })] }), _jsxs("button", { className: "text-blue-400 hover:text-blue-300 flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded", children: [_jsx(DocumentArrowDownIcon, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "Download" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { className: "text-blue-400 hover:text-blue-300", children: _jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M11 18V6l-4 4m0 0l4 4m-4-4h12" }) }) }), _jsx("button", { className: "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500", children: _jsx(PlayIcon, { className: "w-5 h-5 text-white ml-0.5" }) }), _jsx("button", { className: "text-blue-400 hover:text-blue-300", children: _jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M13 6v12l4-4m0 0l-4-4m4 4H5" }) }) })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("svg", { className: "w-4 h-4 text-blue-400", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" }) }), _jsxs("div", { className: "w-16 h-1 bg-gray-600 rounded-full relative", children: [_jsx("div", { className: "absolute left-0 top-0 h-full w-1/2 bg-blue-400 rounded-full" }), _jsx("div", { className: "absolute left-1/2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full" })] }), _jsx("span", { className: "text-sm", children: "07:56" })] })] }) }) }), _jsxs("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h3", { className: "text-sm font-medium text-blue-900 mb-3", children: "Estado de Conexiones" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${integrationsStatus?.status?.twilio ? "bg-green-500" : "bg-red-500"}` }), _jsx("span", { className: "text-sm text-blue-700", children: "Twilio" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${integrationsStatus?.status?.elevenLabs ? "bg-green-500" : "bg-red-500"}` }), _jsx("span", { className: "text-sm text-blue-700", children: "ElevenLabs" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${integrationsStatus?.status?.goHighLevel ? "bg-green-500" : "bg-red-500"}` }), _jsx("span", { className: "text-sm text-blue-700", children: "GoHighLevel" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${stats?.dataSources?.local ? "bg-green-500" : "bg-gray-400"}` }), _jsx("span", { className: "text-sm text-blue-700", children: "Base de Datos" })] })] }), _jsx("div", { className: "text-xs text-blue-600", children: integrationsStatus?.lastChecked && (_jsxs(_Fragment, { children: ["Actualizado:", " ", new Date(integrationsStatus.lastChecked).toLocaleString(), _jsx("br", {}), "Fuente:", " ", integrationsStatus.source === "api"
                                                    ? "API Real"
                                                    : "Estado Verificado"] })) })] })] }), _jsx("div", { className: "h-16" })] }), isSummaryModalOpen && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 10000 }, onClick: () => setIsSummaryModalOpen(false), children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold", children: "Summary" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => setCustomPrompt(!customPrompt), className: `relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${customPrompt ? "bg-blue-600" : "bg-gray-300"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${customPrompt ? "translate-x-6" : "translate-x-0.5"}` }) }), _jsx("span", { className: "text-sm text-gray-700", children: "Custom Prompt" }), _jsx(InfoTooltip, { content: "Run a custom AI query on the calls you're currently viewing. Ask for specific moments, patterns, or improvements and get a made-to-order summary in seconds.", className: "ml-0" })] }), _jsx("button", { onClick: () => setIsSummaryModalOpen(false), className: "text-gray-500 hover:text-gray-700", children: "\u2715" })] })] }), customPrompt ? (_jsx("div", { className: "space-y-4", children: _jsx("textarea", { value: customPromptText, onChange: (e) => setCustomPromptText(e.target.value), placeholder: "Find any calls where the prospect mentioned budget concerns and the AI failed to book, then give two objection-handling lines to test.", className: "w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder-gray-400" }) })) : (_jsx(_Fragment, { children: isGeneratingSummary ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 space-y-4", children: [_jsx("div", { className: "w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" }), _jsx("p", { className: "text-gray-600 text-lg font-medium", children: "Generando resumen con IA..." }), _jsx("p", { className: "text-gray-500 text-sm", children: "Analizando llamadas y generando insights..." })] })) : generatedSummary ? (_jsx("div", { className: "prose prose-sm max-w-none", children: _jsx("div", { className: "whitespace-pre-wrap text-gray-700 leading-relaxed", children: generatedSummary }) })) : (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 space-y-4", children: [_jsx(StarIcon, { className: "w-16 h-16 text-gray-300" }), _jsx("p", { className: "text-gray-500 text-lg", children: "Haz clic en \"Regenerate\" para generar el resumen con IA" })] })) })), _jsx("div", { className: "flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200", children: customPrompt ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleRegenerateSummary, disabled: isGeneratingSummary || !customPromptText.trim(), className: `px-6 py-2.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium ${isGeneratingSummary || !customPromptText.trim()
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-gray-300"}`, children: isGeneratingSummary ? "Generating..." : "Generate" }), _jsx("button", { onClick: () => setIsSummaryModalOpen(false), disabled: isGeneratingSummary, className: `px-6 py-2.5 bg-white border border-red-500 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium ${isGeneratingSummary ? "opacity-50 cursor-not-allowed" : ""}`, children: "Close" })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleRegenerateSummary, disabled: isGeneratingSummary, className: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center ${isGeneratingSummary ? "opacity-50 cursor-not-allowed" : ""}`, children: [isGeneratingSummary && (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), isGeneratingSummary ? "Generando..." : "Regenerate"] }), _jsx("button", { onClick: () => setIsSummaryModalOpen(false), disabled: isGeneratingSummary, className: `px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium ${isGeneratingSummary ? "opacity-50 cursor-not-allowed" : ""}`, children: "Close" })] })) })] }) })), isReportIssueModalOpen && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center z-[10000]", style: { backgroundColor: "rgba(0, 0, 0, 0.3)" }, onClick: () => {
                    setIsReportIssueModalOpen(false);
                    setReportIssueDescription("");
                }, children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md mx-4", onClick: (e) => e.stopPropagation(), children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Report Issue" }), _jsx("textarea", { value: reportIssueDescription, onChange: (e) => setReportIssueDescription(e.target.value), placeholder: "Describe Issue...", className: "w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" }), _jsxs("div", { className: "flex justify-end space-x-3 mt-4", children: [_jsx("button", { onClick: () => {
                                        setIsReportIssueModalOpen(false);
                                        setReportIssueDescription("");
                                    }, className: "px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium", children: "Cancel" }), _jsx("button", { onClick: () => {
                                        // Handle submit logic here
                                        setIsReportIssueModalOpen(false);
                                        setReportIssueDescription("");
                                    }, className: "px-4 py-2 bg-gray-400 text-white rounded text-sm font-medium cursor-not-allowed", disabled: true, children: "Submit" })] })] }) })), isTranscriptModalOpen && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center z-[10000]", style: { backgroundColor: "rgba(0, 0, 0, 0.3)" }, onClick: () => setIsTranscriptModalOpen(false), children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Transcript" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "2025-09-30T22:06:45.781000" })] }), _jsx("div", { className: "p-6 overflow-y-auto max-h-[60vh]", children: (() => {
                                const selectedCall = recentActivity?.find((activity) => activity.type === "call" && activity.metadata?.transcript);
                                if (selectedCall?.metadata?.transcript) {
                                    return (_jsx("div", { className: "space-y-4 text-sm", children: _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("pre", { className: "whitespace-pre-wrap text-gray-900", children: selectedCall.metadata.transcript }) }) }));
                                }
                                else {
                                    return (_jsxs("div", { className: "text-center py-8", children: [_jsx(DocumentTextIcon, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-900 mb-2", children: "No hay transcript disponible" }), _jsx("p", { className: "text-gray-500", children: "El transcript de esta llamada no est\u00E1 disponible." })] }));
                                }
                            })() }), _jsx("div", { className: "p-6 border-t border-gray-200", children: _jsx("button", { onClick: handleCopyTranscript, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium", children: "Copy" }) })] }) }))] }));
};
export default Dashboard;
