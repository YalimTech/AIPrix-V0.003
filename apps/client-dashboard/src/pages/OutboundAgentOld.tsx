import React, { useState } from "react";
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentArrowUpIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";

const OutboundAgent: React.FC = () => {
  const { user } = useAuth();
  const [showCallTransferModal, setShowCallTransferModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showExternalWebhookModal, setShowExternalWebhookModal] =
    useState(false);

  const [settings, setSettings] = useState({
    language: "English",
    interruptSensitivity: "High",
    responseSpeed: "Auto",
    doubleCall: false,
    vmDetection: false,
    initialMessageDelay: 0,
    aiCreativity: 0.7,
  });

  const voiceAgents = [
    {
      id: "1",
      name: "Colin",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Valeria",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Bob",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "4",
      name: "Danny",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "5",
      name: "DannyD",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "6",
      name: "Jannifer",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "7",
      name: "Michael",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "8",
      name: "Kyle",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outbound Agent</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">
                    Outbound Agent
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Create Outbound Agent Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Create Outbound Agent
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client ID */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Client ID
              <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <input
              type="text"
              value={user?.account?.id || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          {/* From Phone Number */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              From Phone Number
              <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Active usage numbers</option>
            </select>
          </div>

          {/* Change Language */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Change Language
              <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Initial Message */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Initial Message
              <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <input
              type="text"
              placeholder="Initial Message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Voice Agent Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Voice Agent
          </label>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {voiceAgents.map((agent) => (
              <div key={agent.id} className="flex-shrink-0 text-center">
                <img
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                  src={agent.image}
                  alt={agent.name}
                />
                <p className="text-sm text-gray-700">{agent.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Interrupt Sensitivity */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Interrupt Sensitivity
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Low</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.interruptSensitivity === "High"}
                onChange={(e) =>
                  handleSettingChange(
                    "interruptSensitivity",
                    e.target.checked ? "High" : "Low",
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-500">High</span>
          </div>
        </div>

        {/* Response Speed */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Response Speed
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sensitive</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.responseSpeed === "Auto"}
                onChange={(e) =>
                  handleSettingChange(
                    "responseSpeed",
                    e.target.checked ? "Auto" : "Sensitive",
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-500">Auto</span>
          </div>
        </div>

        {/* AI Creativity */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            AI Creativity
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.aiCreativity}
              onChange={(e) =>
                handleSettingChange("aiCreativity", parseFloat(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>1</span>
            </div>
          </div>
        </div>

        {/* Call Transfer */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Call Transfer
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <button
            onClick={() => setShowCallTransferModal(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <PhoneIcon className="w-8 h-8 mx-auto text-gray-400" />
          </button>
        </div>

        {/* Calendar Booking */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Calendar Booking
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <button
            onClick={() => setShowCalendarModal(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <CalendarIcon className="w-8 h-8 mx-auto text-gray-400" />
          </button>
        </div>

        {/* Send Post Call Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Send Post Call Info to External Source
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <button
            onClick={() => setShowExternalWebhookModal(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-gray-400" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCallTransferModal}
        onClose={() => setShowCallTransferModal(false)}
        title="Call Transfer"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please enter call transfer details below:
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex">
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
                <span className="text-sm">🇺🇸 +1</span>
              </div>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Logic
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="transferLogic" className="mr-2" />
                <span className="text-sm">Prompt Based</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transferLogic"
                  defaultChecked
                  className="mr-2"
                />
                <span className="text-sm">Keyword Based (More reliable)</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCallTransferModal(false)}
            >
              Reset
            </Button>
            <Button variant="primary">Save</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Calendar Bookings"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button className="flex-1 px-4 py-2 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg font-medium">
              Cal.com
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">
              GHL
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value="javiercantu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              placeholder="Enter API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event ID
            </label>
            <input
              type="text"
              placeholder="Enter event ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCalendarModal(false)}
            >
              Reset
            </Button>
            <Button variant="primary">Validate Cal.Com API Key</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showExternalWebhookModal}
        onClose={() => setShowExternalWebhookModal(false)}
        title="External webhook URL"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            URL of your catch hook where the call information will be sent.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://your-webhook-url.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExternalWebhookModal(false)}
            >
              Reset
            </Button>
            <Button variant="primary">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OutboundAgent;
