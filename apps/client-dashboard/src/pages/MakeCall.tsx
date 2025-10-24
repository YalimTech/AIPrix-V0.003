import { PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAgent } from "../hooks/useAgents";
import { useElevenLabsOutboundCall } from "../hooks/useElevenLabs"; // Hook corregido
import { usePhoneNumbers } from "../hooks/usePhoneNumbers"; // Hook para obtener números
import { useAppStore } from "../store/appStore";

const MakeCall: React.FC = () => {
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

    const ownedNumbers = ownedNumbersResponse as any;
    const fromNumber = ownedNumbers?.[0]?.id;
    if (!fromNumber) {
      addNotification({
        type: "error",
        title: "No Phone Number",
        message: "You do not own any phone numbers to make a call from.",
      });
      return;
    }

    makeCallMutation.mutate(
      {
        agentId: agentId,
        toNumber: phoneNumber,
        agentPhoneNumberId: fromNumber, // Usar el primer número disponible
      },
      {
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
        onError: (error: any) => {
          addNotification({
            type: "error",
            title: "Call Failed",
            message: error.message || "Failed to initiate call",
          });
        },
      }
    );
  };

  if (isAgentLoading || isNumbersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Make A Call</h1>
            <button
              onClick={() => navigate("/saved-agents")}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Agent Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Agent Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 shadow-md"></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agent?.name || "Unknown Agent"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {agent?.type || "Unknown Type"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Form */}
          <div className="mb-6">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <div className="flex gap-3">
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={makeCallMutation.isPending}
              />
              <button
                onClick={handleMakeCall}
                disabled={makeCallMutation.isPending || !phoneNumber}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
              >
                {makeCallMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Calling...
                  </>
                ) : (
                  <>
                    <PhoneIcon className="w-5 h-5" />
                    Call
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the phone number you want to call
            </p>
          </div>

          {/* Agent Details */}
          {agent && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Agent Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      agent.status === "active"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                {agent.voiceName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voice:</span>
                    <span className="font-medium text-gray-900">
                      {agent.voiceName}
                    </span>
                  </div>
                )}
                {agent.language && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium text-gray-900">
                      {agent.language}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <PhoneIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Test Call Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This will initiate a test call using the selected agent. Make
                  sure the phone number is correct and the agent is properly
                  configured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeCall;

