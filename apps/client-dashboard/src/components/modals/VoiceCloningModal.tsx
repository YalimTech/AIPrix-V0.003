import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [voiceConfig, setVoiceConfig] = useState({
    version: "2",
    voice_id: "s3://voice-cloning-zero-shot/e4b758bc-42bb-4487-b1flan de Samsung, con qui",
    emotion: "male_sad",
    speed: 1
  });

  const handleSave = () => {
    onSave(voiceConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Cloned Voice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Configuration (JSON)
                </label>
                <textarea
                  value={JSON.stringify(voiceConfig, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setVoiceConfig(parsed);
                    } catch (error) {
                      // Invalid JSON, keep the text but don't update state
                    }
                  }}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter voice configuration JSON..."
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration Fields:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>version:</strong> Voice configuration version</li>
                  <li><strong>voice_id:</strong> S3 path to voice model</li>
                  <li><strong>emotion:</strong> Voice emotion (male_sad, female_happy, etc.)</li>
                  <li><strong>speed:</strong> Speech speed multiplier (0.5 - 2.0)</li>
                </ul>
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

export default VoiceCloningModal;