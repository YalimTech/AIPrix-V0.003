import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, UserIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { apiClient } from '../../lib/api';
import { useAppStore } from '../../store/appStore';
const ContactWizard = ({ isOpen, onClose, onSuccess, }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [contactData, setContactData] = useState({
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
        mutationFn: (data) => apiClient.post('/contacts', data),
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
        onError: (error) => {
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
    const handleInputChange = (field, value) => {
        setContactData(prev => ({ ...prev, [field]: value }));
    };
    const handleTagAdd = (tag) => {
        if (tag.trim() && !contactData.tags.includes(tag.trim())) {
            setContactData(prev => ({
                ...prev,
                tags: [...prev.tags, tag.trim()],
            }));
        }
    };
    const handleTagRemove = (tagToRemove) => {
        setContactData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }));
    };
    const validateStep = (step) => {
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
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            const formatted = match[1] + (match[2] ? `-${match[2]}` : '') + (match[3] ? `-${match[3]}` : '');
            return formatted;
        }
        return value;
    };
    if (!isOpen)
        return null;
    const currentStepData = steps.find(step => step.id === currentStep);
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content max-w-3xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(UserIcon, { className: "w-5 h-5 mr-2 text-blue-600" }), "Nuevo Contacto"] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Paso ", currentStep, " de ", steps.length, ": ", currentStepData.description] })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex items-center justify-between", children: steps.map((step, index) => {
                            const Icon = step.icon;
                            return (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-400'}`, children: _jsx(Icon, { className: "w-5 h-5" }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: `text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`, children: step.title }) }), index < steps.length - 1 && (_jsx("div", { className: `flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}` }))] }, step.id));
                        }) }) }), _jsxs("div", { className: "space-y-6", children: [currentStep === 1 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(UserIcon, { className: "w-5 h-5 mr-2" }), "Informaci\u00F3n b\u00E1sica"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Nombre ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: contactData.firstName, onChange: (e) => handleInputChange('firstName', e.target.value), placeholder: "Juan", className: "input-field", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Apellido ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: contactData.lastName, onChange: (e) => handleInputChange('lastName', e.target.value), placeholder: "P\u00E9rez", className: "input-field", required: true })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(EnvelopeIcon, { className: "w-4 h-4 inline mr-1" }), "Email ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "email", value: contactData.email, onChange: (e) => handleInputChange('email', e.target.value), placeholder: "juan.perez@empresa.com", className: "input-field", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(PhoneIcon, { className: "w-4 h-4 inline mr-1" }), "Tel\u00E9fono ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "tel", value: contactData.phone, onChange: (e) => handleInputChange('phone', formatPhoneNumber(e.target.value)), placeholder: "555-123-4567", className: "input-field", required: true })] })] })), currentStep === 2 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(BuildingOfficeIcon, { className: "w-5 h-5 mr-2" }), "Informaci\u00F3n adicional"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Empresa" }), _jsx("input", { type: "text", value: contactData.company, onChange: (e) => handleInputChange('company', e.target.value), placeholder: "Empresa ABC", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Posici\u00F3n" }), _jsx("input", { type: "text", value: contactData.position, onChange: (e) => handleInputChange('position', e.target.value), placeholder: "Gerente de Ventas", className: "input-field" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fuente del contacto" }), _jsxs("select", { value: contactData.source, onChange: (e) => handleInputChange('source', e.target.value), className: "input-field", children: [_jsx("option", { value: "", children: "Seleccionar fuente" }), sources.map((source) => (_jsx("option", { value: source, children: source }, source)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Etiquetas" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: contactData.tags.map((tag) => (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: [tag, _jsx("button", { type: "button", onClick: () => handleTagRemove(tag), className: "ml-1 text-blue-600 hover:text-blue-800", children: "\u00D7" })] }, tag))) }), _jsx("input", { type: "text", placeholder: "Agregar etiqueta...", className: "input-field", onKeyPress: (e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleTagAdd(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            } })] })] })), currentStep === 3 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(PhoneIcon, { className: "w-5 h-5 mr-2" }), "Preferencias de contacto"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Zona horaria" }), _jsx("select", { value: contactData.timezone, onChange: (e) => handleInputChange('timezone', e.target.value), className: "input-field", children: timezones.map((tz) => (_jsx("option", { value: tz, children: tz }, tz))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Mejor momento para contactar" }), _jsx("select", { value: contactData.preferredContactTime, onChange: (e) => handleInputChange('preferredContactTime', e.target.value), className: "input-field", children: contactTimes.map((time) => (_jsx("option", { value: time.value, children: time.label }, time.value))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Notas" }), _jsx("textarea", { value: contactData.notes, onChange: (e) => handleInputChange('notes', e.target.value), placeholder: "Informaci\u00F3n adicional sobre el contacto...", rows: 4, className: "input-field resize-none" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: contactData.isActive, onChange: (e) => handleInputChange('isActive', e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("label", { className: "ml-2 text-sm text-gray-700", children: "Contacto activo (puede recibir llamadas)" })] })] }))] }), _jsxs("div", { className: "flex justify-between pt-6", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: currentStep === 1 ? onClose : handlePrevious, className: "flex items-center", children: [_jsx(ChevronLeftIcon, { className: "w-4 h-4 mr-1" }), currentStep === 1 ? 'Cancelar' : 'Anterior'] }), currentStep < 3 ? (_jsxs(Button, { type: "button", onClick: handleNext, disabled: !validateStep(currentStep), className: "flex items-center", children: ["Siguiente", _jsx(ChevronRightIcon, { className: "w-4 h-4 ml-1" })] })) : (_jsx(Button, { type: "button", onClick: handleSubmit, isLoading: createContact.isPending, disabled: !validateStep(currentStep), children: createContact.isPending ? 'Creando...' : 'Crear Contacto' }))] })] }) }));
};
export default ContactWizard;
