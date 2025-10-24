import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface SaveAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: { name: string; description: string }) => void;
  initialName?: string;
  initialDescription?: string;
}

const SaveAgentModal: React.FC<SaveAgentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = ''
}) => {
  const [agentName, setAgentName] = useState(initialName);
  const [agentDescription, setAgentDescription] = useState(initialDescription);

  const handleSave = () => {
    if (agentName.trim()) {
      onSave({ name: agentName, description: agentDescription });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Save Agent</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Please enter your agent name:
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Description
                </label>
                <textarea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent description (optional)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="danger"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!agentName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveAgentModal;
