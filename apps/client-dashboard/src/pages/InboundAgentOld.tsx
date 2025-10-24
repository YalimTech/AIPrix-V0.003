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

const InboundAgent: React.FC = () => {
  const { user } = useAuth();
  const [showCallTransferModal, setShowCallTransferModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showExternalWebhookModal, setShowExternalWebhookModal] =
    useState(false);
  const [showClonedVoiceModal, setShowClonedVoiceModal] = useState(false);

  const [settings, setSettings] = useState({
    language: "Spanish",
    interruptSensitivity: "Low",
    responseSpeed: "Auto",
    doubleCall: false,
    vmDetection: false,
    initialMessageDelay: 0,
    aiCreativity: 0.7,
  });

  const voiceAgents = [
    {
      id: "1",
      name: "Nicole",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Alice",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Ella",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "4",
      name: "Paula",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
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
          <h1 className="text-2xl font-bold text-gray-900">Inbound Agent</h1>
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
                    Inbound Agent
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

      {/* Create Inbound Agent Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Create Inbound Agent
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
        {/* Change Language */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Change Language
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange("language", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Spanish">Spanish</option>
            <option value="English">English</option>
            <option value="French">French</option>
          </select>
        </div>

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

        {/* Pre-made Prompts */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Pre-made Prompts
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Templates</option>
          </select>
        </div>

        {/* Prompt */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Prompt
            <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
          </label>
          <textarea
            rows={4}
            placeholder="Enter your prompt here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">00:00</span>
              <div className="w-32 h-1 bg-gray-200 rounded-full">
                <div className="w-0 h-1 bg-blue-600 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-500">00:16</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            </svg>
            <div className="w-16 h-1 bg-gray-200 rounded-full">
              <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
            </div>
          </div>
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

      <Modal
        isOpen={showClonedVoiceModal}
        onClose={() => setShowClonedVoiceModal(false)}
        title="Cloned Voice"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
            <div>{"{"}</div>
            <div>&nbsp;&nbsp;"version": "2",</div>
            <div>
              &nbsp;&nbsp;"voice_id":
              "s3://voice-cloning-zero-shot/e4b758bc-42bb-4487-b1flan de
              Samsung, con qui",
            </div>
            <div>&nbsp;&nbsp;"emotion": "male_sad",</div>
            <div>&nbsp;&nbsp;"speed": 1</div>
            <div>{"}"}</div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowClonedVoiceModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InboundAgent;
