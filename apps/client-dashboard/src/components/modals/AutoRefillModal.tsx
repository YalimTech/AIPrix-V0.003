import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface AutoRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
}

const AutoRefillModal: React.FC<AutoRefillModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedAmount, setSelectedAmount] = useState(30);

  const refillOptions = [30, 50, 100, 200];

  const handleSave = () => {
    onSave(selectedAmount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Update Auto Refill Amount</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Refill Amount
                </label>
                <div className="space-y-3">
                  {refillOptions.map((amount) => (
                    <label key={amount} className="flex items-center">
                      <input
                        type="radio"
                        name="refillAmount"
                        value={amount}
                        checked={selectedAmount === amount}
                        onChange={(e) => setSelectedAmount(Number(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        ${amount}
                      </span>
                    </label>
                  ))}
                </div>
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

export default AutoRefillModal;