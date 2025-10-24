import React from "react";
import { useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";

const VoiceAgent: React.FC = () => {
  const navigate = useNavigate();

  const handleOutboundClick = () => {
    navigate("/outbound-agent");
  };

  const handleInboundClick = () => {
    navigate("/inbound-agent");
  };

  const handleClose = () => {
    navigate("/saved-agents");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Voice Agent
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-10">
          <div className="grid grid-cols-2 gap-8">
            {/* Outbound Card */}
            <div
              onClick={handleOutboundClick}
              className="border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <PhoneArrowUpRightIcon className="w-12 h-12 text-blue-500" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Outbound
                </h3>
                <div className="w-16 h-1 bg-blue-500 rounded-full mb-6"></div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  The AI number places calls automatically to your leads or
                  clients, handling tasks like sales outreach, reminders, and
                  appointment setting—freeing your team from manual dialing.
                </p>
              </div>
            </div>

            {/* Inbound Card */}
            <div
              onClick={handleInboundClick}
              className="border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <PhoneArrowDownLeftIcon className="w-12 h-12 text-blue-500" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Inbound
                </h3>
                <div className="w-16 h-1 bg-blue-500 rounded-full mb-6"></div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  Incoming calls to your dedicated AI line are answered by the
                  virtual assistant, which offers information, helps callers,
                  and seamlessly connects them to the appropriate team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
