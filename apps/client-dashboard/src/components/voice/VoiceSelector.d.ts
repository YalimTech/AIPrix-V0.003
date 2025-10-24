import React from "react";
interface Voice {
    id: string;
    name: string;
    previewUrl?: string;
    languageCapabilities?: {
        supported: string[];
        multilingual?: boolean;
    };
    isCustom?: boolean;
}
interface VoiceSelectorProps {
    voices: Voice[];
    selectedVoiceId: string | null;
    onSelectVoice: (voiceId: string) => void;
    onAddCustomVoice?: () => void;
    isLoading?: boolean;
    error?: Error | null;
}
declare const VoiceSelector: React.FC<VoiceSelectorProps>;
export default VoiceSelector;
