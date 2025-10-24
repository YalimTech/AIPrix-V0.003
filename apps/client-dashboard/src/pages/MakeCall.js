import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAgent } from "../hooks/useAgents";
import { useElevenLabsOutboundCall } from "../hooks/useElevenLabs"; // Hook corregido
import { usePhoneNumbers } from "../hooks/usePhoneNumbers"; // Hook para obtener números
import { useAppStore } from "../store/appStore";
const MakeCall = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const agentId = searchParams.get("agentId");
    const [phoneNumber, setPhoneNumber] = useState("");
    const addNotification = useAppStore((state) => state.addNotification);
    const { data: agent, isLoading: isAgentLoading } = useGetAgent(agentId || "");
    const { data: ownedNumbersResponse, isLoading: isNumbersLoading } = usePhoneNumbers();
    const makeCallMutation = useElevenLabsOutboundCall(); // Mutación corregida
    useEffect(() => {
        if (!agentId) {
            addNotification({
                type: "error",
                title: "Agent ID Missing",
                message: "No agent ID provided",
            });
            navigate("/saved-agents");
        }
    }, [agentId, navigate, addNotification]);
    const handleMakeCall = async () => {
        if (!phoneNumber) {
            addNotification({
                type: "error",
                title: "Phone Number Required",
                message: "Please enter a phone number",
            });
            return;
        }
        if (!agentId) {
            addNotification({
                type: "error",
                title: "Agent ID Missing",
                message: "No agent ID provided",
            });
            return;
        }
        const ownedNumbers = ownedNumbersResponse;
        const fromNumber = ownedNumbers?.[0]?.id;
        if (!fromNumber) {
            addNotification({
                type: "error",
                title: "No Phone Number",
                message: "You do not own any phone numbers to make a call from.",
            });
            return;
        }
        makeCallMutation.mutate({
            agentId: agentId,
            toNumber: phoneNumber,
            agentPhoneNumberId: fromNumber, // Usar el primer número disponible
        }, {
            onSuccess: () => {
                addNotification({
                    type: "success",
                    title: "Call Initiated",
                    message: `Calling ${phoneNumber} with agent "${agent?.name || "Unknown"}"`,
                });
                setTimeout(() => {
                    navigate("/saved-agents");
                }, 2000);
            },
            onError: (error) => {
                addNotification({
                    type: "error",
                    title: "Call Failed",
                    message: error.message || "Failed to initiate call",
                });
            },
        });
    };
    if (isAgentLoading || isNumbersLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Make A Call" }), _jsx("button", { onClick: () => navigate("/saved-agents"), className: "text-gray-500 hover:text-gray-700", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }) }) }), _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Agent Information" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 shadow-md" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: agent?.name || "Unknown Agent" }), _jsx("p", { className: "text-sm text-gray-600", children: agent?.type || "Unknown Type" })] })] }) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "tel", id: "phone", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "+1 (555) 123-4567", className: "flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", disabled: makeCallMutation.isPending }), _jsx("button", { onClick: handleMakeCall, disabled: makeCallMutation.isPending || !phoneNumber, className: "px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors", children: makeCallMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Calling..."] })) : (_jsxs(_Fragment, { children: [_jsx(PhoneIcon, { className: "w-5 h-5" }), "Call"] })) })] }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Enter the phone number you want to call" })] }), agent && (_jsxs("div", { className: "border-t pt-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-3", children: "Agent Details" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), _jsx("span", { className: `font-medium ${agent.status === "active"
                                                            ? "text-green-600"
                                                            : "text-gray-600"}`, children: agent.status })] }), agent.voiceName && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Voice:" }), _jsx("span", { className: "font-medium text-gray-900", children: agent.voiceName })] })), agent.language && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Language:" }), _jsx("span", { className: "font-medium text-gray-900", children: agent.language })] }))] })] }))] }), _jsx("div", { className: "mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(PhoneIcon, { className: "h-5 w-5 text-blue-400" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-blue-800", children: "Test Call Information" }), _jsx("div", { className: "mt-2 text-sm text-blue-700", children: _jsx("p", { children: "This will initiate a test call using the selected agent. Make sure the phone number is correct and the agent is properly configured." }) })] })] }) })] })] }));
};
export default MakeCall;
