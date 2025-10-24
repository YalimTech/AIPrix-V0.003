import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import Button from '../ui/Button';

interface MakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMakeCall: (callData: { fromNumber: string; toNumber: string }) => void;
}

const MakeCallModal: React.FC<MakeCallModalProps> = ({
  isOpen,
  onClose,
  onMakeCall
}) => {
  const [fromNumber, setFromNumber] = useState('Active usage numbers');
  const [toNumber, setToNumber] = useState('');

  const handleMakeCall = () => {
    if (fromNumber && toNumber) {
      onMakeCall({ fromNumber, toNumber });
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
            <h2 className="text-xl font-semibold text-gray-900">Make A call</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Phone Number
                </label>
                <select
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active usage numbers">Active usage numbers</option>
                  <option value="+1 (650) 684-1386">+1 (650) 684-1386</option>
                  <option value="+1 (786) 304-1856">+1 (786) 304-1856</option>
                  <option value="+1 (813) 414-5874">+1 (813) 414-5874</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Phone Number
                </label>
                <div className="flex">
                  <select className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+34">🇪🇸 +34</option>
                  </select>
                  <input
                    type="tel"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                onClick={handleMakeCall}
                disabled={!fromNumber || !toNumber}
                className="w-full"
              >
                Launch Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeCallModal;