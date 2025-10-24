import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface TwilioConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { accountSid: string; authToken: string }) => void;
}

const TwilioConfigModal: React.FC<TwilioConfigModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');

  const handleSave = () => {
    if (accountSid && authToken) {
      onSave({ accountSid, authToken });
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
            <h2 className="text-xl font-semibold text-gray-900">Twilio Configuration</h2>
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
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your Twilio Account SID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twilio Auth Token
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your Twilio Auth Token"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!accountSid || !authToken}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwilioConfigModal;