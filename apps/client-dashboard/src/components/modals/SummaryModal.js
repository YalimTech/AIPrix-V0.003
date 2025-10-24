import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import InfoTooltip from "../ui/InfoTooltip";
const SummaryModal = ({ isOpen, onClose, callData, // eslint-disable-line @typescript-eslint/no-unused-vars
 }) => {
    const [customPrompt, setCustomPrompt] = useState(false);
    const [customPromptText, setCustomPromptText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState("");
    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setGeneratedSummary(summaryContent);
            setIsGenerating(false);
        }, 2000);
    };
    if (!isOpen)
        return null;
    const summaryContent = `Call Log Summary Report

1. KPI Summary
• Total Calls: 3 (100%)
• Did Not Answer (Voicemail): 1 (33.33%)
• Call Did Not Connect (Busy/No Answer): 0 (0.00%)
• Answered: 2 (66.67%)
• Booked Appointments: 0 (0.00%)
• Calls < 20 seconds: 1 (33.33%)
• Calls 20-50 seconds: 1 (33.33%)
• Calls > 50 seconds: 1 (33.33%)

2. Key Observations
• Average Engagement: The majority of calls were answered (66.67%), indicating solid reach rates.
• Short Duration Calls: One call lasted less than 20 seconds (voicemail), and another was just over 40 seconds—a sign that engagement may drop off quickly if conversational hooks are not immediate.
• No Appointments Booked: Despite one highly engaged call (lasting nearly 8 minutes), no appointments were secured, suggesting a potential disconnect between information gathering and conversion.
• Extended Information Gathering: In the longest call, the bot efficiently collected detailed lead information but failed to transition toward booking an appointment.
• Customer Temperament: Call transcripts indicate customers are open to dialogue and willing to provide personal/project information, but expect quick answers about pricing and direct assistance (including preferring to answer forms verbally).
• Handling of Human Queries: The bot encounters requests about company personnel ("Quién es…?"), office locations, and alternative contact methods (WhatsApp), but responds with limited information, sometimes redirecting to manual channels.
• Follow-Through: In longer calls, the bot delivers information but misses natural closing statements or upsell opportunities ("Would you like to book a design consult?" or "Can I schedule a call with our specialist to go over a proposal?").

3. Recommended Actions

1. Handling Objections
Insight: When pressed for price information, the bot cites the need for more details and defers to a form, failing to address the customer's desire for at least a price range.

Example Call: Longest call (Answered, 479.2 seconds)
Link: [Reference: Outbound Call to +18299227709, 479.15s]
Transcript Excerpt:
BOT: "Entiendo que quieras saber el precio, pero cada proyecto es único..."
HUMAN: "Me gustaría responder las preguntas del formulario por aquí."

Action:
Adjust scripts to offer a price range or example project cost ("Nuestros proyectos suelen oscilar entre $X y $Y según el alcance. ¿Le interesaría recibir una propuesta más concreta?") before requesting extensive details.

2. Human Transfer Requests
Insight: The lead requests information about company personnel and wants a phone number delivered slowly and clearly.

Example Call: Longest call (Answered, 479.2 seconds)
Transcript Excerpt:
HUMAN: "Repítame... repíteme otra vez el número... me lo podrías decir más despacio?"

Action:
Add a contingency where if the customer requests more humanized details or repeated information, the bot politely offers: "¿Le gustaría que alguien del equipo le contacte directamente por WhatsApp o llamada para mayor detalle?" and logs a transfer request.

3. Encouraging Engagement
Insight: After collecting basic info, the bot moves into lengthy data gathering without steering toward a clear next step (no explicit CTA for scheduling or next actions).

Example Call: Longest call
Transcript Excerpt:
BOT: "Voy a crear una carpeta en Google Drive para ti..."

Action:
Insert prompts at key points: "En base a la información que me ha compartido, ¿le gustaría agendar una reunión con nuestro especialista para definir detalles y recibir una cotización personalizada?"

4. Improving Topic Transitions
Insight: Sudden switches occur, especially when the customer asks about staff or office info. The bot either lacks information or diverts abruptly.

Example Call: Longest call
Transcript Excerpt:
HUMAN: "¿Quién es Judas Cepeda?"
BOT: "El Sr. Judas Cepeda es el CEO de Cepeda Design..."

Action:
Train the bot to reconnect to the project discussion after off-topic questions: "Además de aclarar esa duda, ¿quiere que le explique más sobre alguno de nuestros servicios o siguiente paso?"

5. Better Initial Message (if many <20s calls)
Since there is one <20s call (voicemail), here are three improved initial messages to boost immediate engagement:

• "¡Hola! Le hablo de Cepeda Design. ¿Está interesado en transformar su espacio o tiene alguna consulta sobre nuestros servicios de interiorismo?"
• "¡Buenas! Mi nombre es [Nombre del bot] de Cepeda Design. ¿En qué tipo de proyecto de diseño podría asistirle hoy?"
• "¡Saludos desde Cepeda Design! ¿Le gustaría saber cómo podemos ayudarle a renovar y planificar sus espacios?"

6. Better Pitch (for 20-50s calls)
Given one 20-50s call, here are three stronger pitches:

• "Ofrecemos paquetes de diseño interior remotos y presenciales, ideales para renovar cualquier espacio de forma eficiente y personalizada. ¿Le interesa una propuesta sin compromiso?"
• "Desde opciones rápidas de estilismo hasta gestión integral de proyectos, adaptamos nuestro servicio a sus necesidades. ¿Le gustaría recibir una recomendación personalizada?"
• "Trabajamos con todo tipo de estilos y presupuestos. ¿Le gustaría conocer ejemplos y precios aproximados para su espacio?"

4. Conclusion
While call answer rates are strong, the lack of appointment bookings suggests a need to shift from pure data collection and information spraying to relationship-building and clear, actionable next steps. The bot handles basic queries but needs enhanced capability for:

• Giving indicative pricing,
• Handling off-topic/human requests robustly,
• Encouraging direct scheduling,
• Providing smooth conversational transitions.

By refining opening statements, strengthening the value pitch, inserting transition CTAs, and supporting human transfer requests where appropriate, appointment conversion rates and lead quality should improve with subsequent calls.

Next Steps:
Review and integrate suggested scripts and behavioral improvements into the AI agent's prompt/logic. Monitor subsequent campaign data for improved appointment rates and lead qualification.`;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "px-6 py-5 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "Summary" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setCustomPrompt(!customPrompt), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${customPrompt ? "bg-blue-600" : "bg-gray-300"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${customPrompt ? "translate-x-6" : "translate-x-0.5"}` }) }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Custom Prompt" }), _jsx(InfoTooltip, { content: "Run a custom AI query on the calls you're currently viewing. Ask for specific moments, patterns, or improvements and get a made-to-order summary in seconds.", className: "ml-0" })] })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto overflow-x-hidden px-6 py-6", children: customPrompt ? (
                    /* Custom Prompt Input */
                    _jsx("div", { children: _jsx("textarea", { value: customPromptText, onChange: (e) => setCustomPromptText(e.target.value), placeholder: "Find any calls where the prospect mentioned budget concerns and the AI failed to book, then give two objection-handling lines to test.", className: "w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-700 leading-relaxed" }) })) : (
                    /* Generated Summary */
                    _jsx("div", { className: "prose prose-sm max-w-none", children: generatedSummary ? (_jsx("pre", { className: "whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed", children: generatedSummary })) : (_jsx("div", { className: "text-center py-12 text-gray-400 text-sm", children: "Click \"Generate\" to create a summary" })) })) }), _jsxs("div", { className: "px-6 py-4 border-t border-gray-200 space-y-3", children: [_jsx("button", { onClick: handleGenerate, disabled: isGenerating || (customPrompt && !customPromptText.trim()), className: "w-full px-5 py-2.5 text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isGenerating ? "Generating..." : "Generate" }), _jsx("button", { onClick: onClose, className: "w-full px-5 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors", children: "Close" })] })] }) }));
};
export default SummaryModal;
