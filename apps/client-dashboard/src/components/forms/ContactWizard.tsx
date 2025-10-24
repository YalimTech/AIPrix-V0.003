import React, { useState } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, UserIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { apiClient } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

interface ContactWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ContactData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 2: Additional Info
  company: string;
  position: string;
  source: string;
  tags: string[];
  
  // Step 3: Preferences
  timezone: string;
  preferredContactTime: string;
  notes: string;
  isActive: boolean;
}

const ContactWizard: React.FC<ContactWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [contactData, setContactData] = useState<ContactData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    tags: [],
    timezone: 'America/Mexico_City',
    preferredContactTime: 'business_hours',
    notes: '',
    isActive: true,
  });

  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  const createContact = useMutation({
    mutationFn: (data: ContactData) => apiClient.post('/contacts', data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Contacto creado',
        message: 'El contacto se ha creado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error al crear contacto',
        message: error.message || 'No se pudo crear el contacto',
      });
    },
  });

  const steps = [
    {
      id: 1,
      title: 'Información básica',
      description: 'Datos principales del contacto',
      icon: UserIcon,
    },
    {
      id: 2,
      title: 'Información adicional',
      description: 'Empresa y detalles profesionales',
      icon: BuildingOfficeIcon,
    },
    {
      id: 3,
      title: 'Preferencias',
      description: 'Configuración de contacto',
      icon: PhoneIcon,
    },
  ];

  const sources = [
    'Website',
    'Referral',
    'Social Media',
    'Cold Call',
    'Email Campaign',
    'Trade Show',
    'Partner',
    'Other',
  ];

  const timezones = [
    'America/Mexico_City',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const contactTimes = [
    { value: 'business_hours', label: 'Horario comercial (9 AM - 6 PM)' },
    { value: 'morning', label: 'Mañana (6 AM - 12 PM)' },
    { value: 'afternoon', label: 'Tarde (12 PM - 6 PM)' },
    { value: 'evening', label: 'Noche (6 PM - 10 PM)' },
    { value: 'anytime', label: 'Cualquier momento' },
  ];

  const handleInputChange = (field: keyof ContactData, value: any) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !contactData.tags.includes(tag.trim())) {
      setContactData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setContactData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(contactData.firstName && contactData.lastName && contactData.email && contactData.phone);
      case 2:
        return true; // Step 2 is optional
      case 3:
        return true; // Step 3 is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await createContact.mutateAsync(contactData);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const formatted = match[1] + (match[2] ? `-${match[2]}` : '') + (match[3] ? `-${match[3]}` : '');
      return formatted;
    }
    return value;
  };

  if (!isOpen) return null;

  const currentStepData = steps.find(step => step.id === currentStep)!;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              Nuevo Contacto
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Paso {currentStep} de {steps.length}: {currentStepData.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Información básica
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Juan"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Pérez"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="juan.perez@empresa.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                  placeholder="555-123-4567"
                  className="input-field"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Información adicional
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={contactData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Empresa ABC"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición
                  </label>
                  <input
                    type="text"
                    value={contactData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Gerente de Ventas"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente del contacto
                </label>
                <select
                  value={contactData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar fuente</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {contactData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Agregar etiqueta..."
                  className="input-field"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2" />
                Preferencias de contacto
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona horaria
                  </label>
                  <select
                    value={contactData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="input-field"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mejor momento para contactar
                  </label>
                  <select
                    value={contactData.preferredContactTime}
                    onChange={(e) => handleInputChange('preferredContactTime', e.target.value)}
                    className="input-field"
                  >
                    {contactTimes.map((time) => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={contactData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Información adicional sobre el contacto..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Contacto activo (puede recibir llamadas)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="flex items-center"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center"
            >
              Siguiente
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              isLoading={createContact.isPending}
              disabled={!validateStep(currentStep)}
            >
              {createContact.isPending ? 'Creando...' : 'Crear Contacto'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactWizard;
