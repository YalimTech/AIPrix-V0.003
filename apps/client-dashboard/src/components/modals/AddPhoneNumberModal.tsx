import React, { useState } from 'react';
import { XMarkIcon, PhoneIcon, GlobeAltIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { apiClient } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

interface AddPhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AvailablePhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  country: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
  cost: string;
}

const AddPhoneNumberModal: React.FC<AddPhoneNumberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [country, setCountry] = useState('US');
  const [areaCode, setAreaCode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  const countries = [
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
    { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
  ];

  const searchNumbers = async () => {
    if (!country) {
      addNotification({
        type: 'warning',
        title: 'País requerido',
        message: 'Por favor selecciona un país',
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await apiClient.get<AvailablePhoneNumber[]>(
        `/phone-numbers/available?country=${country}&areaCode=${areaCode}&limit=10`
      );
      setAvailableNumbers(response);
      
      if (response.length === 0) {
        addNotification({
          type: 'info',
          title: 'Sin números disponibles',
          message: 'No se encontraron números disponibles para los criterios seleccionados',
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al buscar números',
        message: error.message || 'No se pudieron obtener los números disponibles',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const purchaseNumber = async () => {
    if (!selectedNumber) {
      addNotification({
        type: 'warning',
        title: 'Número requerido',
        message: 'Por favor selecciona un número',
      });
      return;
    }

    setPurchaseLoading(true);
    try {
      await apiClient.post('/phone-numbers/buy', {
        phoneNumber: selectedNumber,
        country,
      });

      addNotification({
        type: 'success',
        title: 'Número comprado',
        message: `Número ${selectedNumber} comprado exitosamente`,
      });

      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      onClose();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al comprar número',
        message: error.message || 'No se pudo comprar el número',
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return number;
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PhoneIcon className="w-5 h-5 mr-2 text-blue-600" />
            Comprar Número Telefónico
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search Criteria */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Criterios de búsqueda</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input-field"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de área (opcional)
                </label>
                <input
                  type="text"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="555"
                  className="input-field"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={searchNumbers}
                variant="primary"
                isLoading={searchLoading}
                disabled={!country}
                className="w-full md:w-auto"
              >
                {searchLoading ? 'Buscando...' : 'Buscar Números'}
              </Button>
            </div>
          </div>

          {/* Available Numbers */}
          {availableNumbers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Números disponibles ({availableNumbers.length})
              </h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {availableNumbers.map((number, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedNumber === number.phoneNumber
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedNumber(number.phoneNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            checked={selectedNumber === number.phoneNumber}
                            onChange={() => setSelectedNumber(number.phoneNumber)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-3 text-lg font-medium text-gray-900">
                            {formatPhoneNumber(number.phoneNumber)}
                          </span>
                        </div>
                        
                        <div className="ml-7 mt-1">
                          <p className="text-sm text-gray-600">
                            {number.locality}, {number.region}, {number.country}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            {number.capabilities.voice && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Voz
                              </span>
                            )}
                            {number.capabilities.sms && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                SMS
                              </span>
                            )}
                            {number.capabilities.mms && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                MMS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-lg font-semibold text-gray-900">
                          <BanknotesIcon className="w-5 h-5 mr-1" />
                          {formatCurrency(number.cost)}
                        </div>
                        <p className="text-xs text-gray-500">por mes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Summary */}
          {selectedNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen de compra</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {formatPhoneNumber(selectedNumber)}
                </span>
                <span className="text-sm font-medium text-blue-900">
                  {formatCurrency('1.00')}/mes
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={purchaseLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={purchaseNumber}
              variant="primary"
              className="flex-1"
              isLoading={purchaseLoading}
              disabled={!selectedNumber}
            >
              {purchaseLoading ? 'Comprando...' : 'Comprar Número'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPhoneNumberModal;
