import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MicrophoneIcon, DocumentArrowDownIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
const CallLogs = () => {
    const [showTranscriptModal, setShowTranscriptModal] = useState(false);
    // Mock data - en producción vendría de la API
    const callLogs = [
        {
            id: '1',
            contactName: 'Fernando Carreon',
            phoneNumber: '16506841386',
            outcome: 'Answered',
            direction: 'Outbound',
            date: 'Friday, 26 April 2024 07:39 PM',
            duration: '3m 13s',
            recording: 'available',
            transcript: 'available',
        },
        {
            id: '2',
            contactName: 'Fernando Carreon',
            phoneNumber: '16506841386',
            outcome: 'Answered',
            direction: 'Outbound',
            date: 'Friday, 26 April 2024 08:15 PM',
            duration: '50s',
            recording: 'available',
            transcript: 'available',
        },
        {
            id: '3',
            contactName: 'Fernando Carreon',
            phoneNumber: '16506841386',
            outcome: 'Answered',
            direction: 'Outbound',
            date: 'Friday, 26 April 2024 09:30 PM',
            duration: '2s',
            recording: 'available',
            transcript: 'available',
        },
        {
            id: '4',
            contactName: 'Fernando Carreon',
            phoneNumber: '16506841386',
            outcome: 'Answered',
            direction: 'Outbound',
            date: 'Friday, 26 April 2024 10:45 PM',
            duration: '4s',
            recording: 'available',
            transcript: 'available',
        },
    ];
    const callLogColumns = [
        { key: 'contactName', title: 'Contact Name' },
        { key: 'phoneNumber', title: 'Phone Number' },
        { key: 'outcome', title: 'Outcome' },
        { key: 'direction', title: 'Direction' },
        { key: 'date', title: 'Date' },
        { key: 'duration', title: 'Duration' },
        {
            key: 'recording',
            title: 'Recording',
            render: () => (_jsxs(Button, { variant: "primary", size: "sm", children: [_jsx(PlayIcon, { className: "w-4 h-4 mr-1" }), "Listen"] })),
        },
        {
            key: 'transcript',
            title: 'Transcript and Notes',
            render: () => (_jsxs(Button, { variant: "primary", size: "sm", onClick: () => setShowTranscriptModal(true), children: [_jsx(DocumentTextIcon, { className: "w-4 h-4 mr-1" }), "Read"] })),
        },
    ];
    const transcriptData = {
        contactName: 'Fernando Carreon',
        date: 'Friday, 26 April 2024 07:39 PM',
        transcript: `[01.42.07] BOT: Genial. Para completar la reserva, necesitaré algunos detalles adicionales, como tu nombre completo, información de contacto y cualquier solicitud especial que puedas tener.

[01:53.15] BOT: Una vez que tenga esa información, te enviaré un enlace para que puedas completar la reserva de forma segura.

[02:16.83] HUMAN: Ok, mi nombre es Javier Cantú. Mi número de teléfono es ochenta y uno, diecinueve trece setenta y ocho, veintiocho. Y mi correo electrónico es Javier Cantú arroba b tres sesenta agencia punto com.

[02:17.67] BOT: Perfecto, Javier. Te enviaré un enlace a tu número de teléfono para que puedas completar la reserva.

[02:24.78] BOT: También recibirás un correo electrónico de confirmación con todos los detalles de tu reserva.

[02:29.34] BOT: ¿Hay algo más en lo que pueda ayudarte hoy?

[02:40.68] HUMAN: No, ¿me puedes confirmar solamente los sea, que que anotaste correctamente mi mi número de contacto y mi correo?

[02:41.71] BOT: Claro, Javier. Confirmo que anoté correctamente tu número de teléfono como ochenta y uno, diecinueve trece setenta y ocho, veintiocho, y tu correo electrónico como Javier Cantú arroba b tres sesenta agencia punto com.

[02:58.93] HUMAN: Así es, sí, correcto.

[03:00.00] BOT: Perfecto, Javier. Te enviaré el enlace para que puedas completar tu reserva.

[03:05.50] BOT: ¡Gracias por elegir Oasis Stay Hotel y que tengas un excelente día!`
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(MicrophoneIcon, { className: "w-6 h-6 mr-2" }), "Call Logs & Recording"] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Button, { variant: "outline", children: [_jsx(DocumentArrowDownIcon, { className: "w-4 h-4 mr-2" }), "Export"] }), _jsxs(Button, { variant: "outline", children: [_jsx(DocumentArrowDownIcon, { className: "w-4 h-4 mr-2" }), "Export All"] })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contact Name" }), _jsx("input", { type: "text", placeholder: "Search by name", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contact Number" }), _jsx("input", { type: "tel", placeholder: "Search by number", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Outcome" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { children: "All outcomes" }), _jsx("option", { children: "Answered" }), _jsx("option", { children: "No Answer" }), _jsx("option", { children: "Busy" }), _jsx("option", { children: "Failed" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date Range" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "date", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("input", { type: "date", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Call History" }) }), _jsx("div", { className: "p-6", children: _jsx(Table, { data: callLogs, columns: callLogColumns, emptyMessage: "No call logs available" }) })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-700", children: "Rows per page:" }), _jsxs("select", { className: "px-2 py-1 border border-gray-300 rounded text-sm", children: [_jsx("option", { children: "10" }), _jsx("option", { children: "25" }), _jsx("option", { children: "50" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-700", children: "1-4 of 4" }), _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { className: "p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700", children: _jsx(PlayIcon, { className: "w-4 h-4" }) }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "00:00" }), _jsx("div", { className: "flex-1 h-1 bg-gray-200 rounded-full", children: _jsx("div", { className: "w-0 h-1 bg-blue-600 rounded-full" }) }), _jsx("span", { className: "text-sm text-gray-500", children: "03:13" })] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("svg", { className: "w-5 h-5 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z", clipRule: "evenodd" }) }), _jsx("div", { className: "w-16 h-1 bg-gray-200 rounded-full", children: _jsx("div", { className: "w-8 h-1 bg-blue-600 rounded-full" }) })] })] }) }), _jsx(Modal, { isOpen: showTranscriptModal, onClose: () => setShowTranscriptModal(false), title: "Transcript From Roleplay", size: "xl", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-sm text-gray-500", children: [transcriptData.contactName, " - ", transcriptData.date] }), _jsx("div", { className: "bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto", children: _jsx("pre", { className: "text-sm text-gray-800 whitespace-pre-wrap font-mono", children: transcriptData.transcript }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "primary", children: "Copy" }) })] }) })] }));
};
export default CallLogs;
