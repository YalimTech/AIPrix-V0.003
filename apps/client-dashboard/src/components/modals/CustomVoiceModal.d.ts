import React from 'react';
interface CustomVoiceConfig {
    type: string;
    voice_id: string;
    model_id?: string;
    stability?: number;
    similarity_boost?: number;
    [key: string]: any;
}
interface CustomVoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: CustomVoiceConfig, name: string) => void;
}
declare const CustomVoiceModal: React.FC<CustomVoiceModalProps>;
export default CustomVoiceModal;
