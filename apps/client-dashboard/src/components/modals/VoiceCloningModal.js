import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
const VoiceCloningModal = ({ isOpen, onClose, onSave }) => {
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
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex min-h-screen items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-2xl w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Cloned Voice" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Voice Configuration (JSON)" }), _jsx("textarea", { value: JSON.stringify(voiceConfig, null, 2), onChange: (e) => {
                                                        try {
                                                            const parsed = JSON.parse(e.target.value);
                                                            setVoiceConfig(parsed);
                                                        }
                                                        catch (error) {
                                                            // Invalid JSON, keep the text but don't update state
                                                        }
                                                    }, rows: 12, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm", placeholder: "Enter voice configuration JSON..." })] }), _jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Configuration Fields:" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("li", { children: [_jsx("strong", { children: "version:" }), " Voice configuration version"] }), _jsxs("li", { children: [_jsx("strong", { children: "voice_id:" }), " S3 path to voice model"] }), _jsxs("li", { children: [_jsx("strong", { children: "emotion:" }), " Voice emotion (male_sad, female_happy, etc.)"] }), _jsxs("li", { children: [_jsx("strong", { children: "speed:" }), " Speech speed multiplier (0.5 - 2.0)"] })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { variant: "danger", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, children: "Save" })] })] })] })] }) }));
};
export default VoiceCloningModal;
