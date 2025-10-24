import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XMarkIcon, PhoneIcon, GlobeAltIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { apiClient } from '../../lib/api';
import { useAppStore } from '../../store/appStore';
const AddPhoneNumberModal = ({ isOpen, onClose, }) => {
    const [country, setCountry] = useState('US');
    const [areaCode, setAreaCode] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState('');
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
            const response = await apiClient.get(`/phone-numbers/available?country=${country}&areaCode=${areaCode}&limit=10`);
            setAvailableNumbers(response);
            if (response.length === 0) {
                addNotification({
                    type: 'info',
                    title: 'Sin números disponibles',
                    message: 'No se encontraron números disponibles para los criterios seleccionados',
                });
            }
        }
        catch (error) {
            addNotification({
                type: 'error',
                title: 'Error al buscar números',
                message: error.message || 'No se pudieron obtener los números disponibles',
            });
        }
        finally {
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
        }
        catch (error) {
            addNotification({
                type: 'error',
                title: 'Error al comprar número',
                message: error.message || 'No se pudo comprar el número',
            });
        }
        finally {
            setPurchaseLoading(false);
        }
    };
    const formatPhoneNumber = (number) => {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
            if (match) {
                return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
            }
        }
        return number;
    };
    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(num);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(PhoneIcon, { className: "w-5 h-5 mr-2 text-blue-600" }), "Comprar N\u00FAmero Telef\u00F3nico"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-4", children: "Criterios de b\u00FAsqueda" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(GlobeAltIcon, { className: "w-4 h-4 inline mr-1" }), "Pa\u00EDs ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("select", { value: country, onChange: (e) => setCountry(e.target.value), className: "input-field", children: countries.map((c) => (_jsxs("option", { value: c.code, children: [c.flag, " ", c.name] }, c.code))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "C\u00F3digo de \u00E1rea (opcional)" }), _jsx("input", { type: "text", value: areaCode, onChange: (e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3)), placeholder: "555", className: "input-field", maxLength: 3 })] })] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { onClick: searchNumbers, variant: "primary", isLoading: searchLoading, disabled: !country, className: "w-full md:w-auto", children: searchLoading ? 'Buscando...' : 'Buscar Números' }) })] }), availableNumbers.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium text-gray-900 mb-4", children: ["N\u00FAmeros disponibles (", availableNumbers.length, ")"] }), _jsx("div", { className: "space-y-3 max-h-64 overflow-y-auto custom-scrollbar", children: availableNumbers.map((number, index) => (_jsx("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedNumber === number.phoneNumber
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'}`, onClick: () => setSelectedNumber(number.phoneNumber), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", checked: selectedNumber === number.phoneNumber, onChange: () => setSelectedNumber(number.phoneNumber), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" }), _jsx("span", { className: "ml-3 text-lg font-medium text-gray-900", children: formatPhoneNumber(number.phoneNumber) })] }), _jsxs("div", { className: "ml-7 mt-1", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [number.locality, ", ", number.region, ", ", number.country] }), _jsxs("div", { className: "flex items-center space-x-4 mt-2", children: [number.capabilities.voice && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "Voz" })), number.capabilities.sms && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "SMS" })), number.capabilities.mms && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: "MMS" }))] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center text-lg font-semibold text-gray-900", children: [_jsx(BanknotesIcon, { className: "w-5 h-5 mr-1" }), formatCurrency(number.cost)] }), _jsx("p", { className: "text-xs text-gray-500", children: "por mes" })] })] }) }, index))) })] })), selectedNumber && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-blue-900 mb-2", children: "Resumen de compra" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-blue-700", children: formatPhoneNumber(selectedNumber) }), _jsxs("span", { className: "text-sm font-medium text-blue-900", children: [formatCurrency('1.00'), "/mes"] })] })] })), _jsxs("div", { className: "flex space-x-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, className: "flex-1", disabled: purchaseLoading, children: "Cancelar" }), _jsx(Button, { onClick: purchaseNumber, variant: "primary", className: "flex-1", isLoading: purchaseLoading, disabled: !selectedNumber, children: purchaseLoading ? 'Comprando...' : 'Comprar Número' })] })] })] }) }));
};
export default AddPhoneNumberModal;
