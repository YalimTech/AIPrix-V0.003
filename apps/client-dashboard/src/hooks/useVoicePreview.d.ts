export declare const useVoicePreview: () => {
    playPreview: (voiceId: string, language: string) => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
    duration: number;
    currentTime: number;
    currentVoiceId: string | null;
    volume: number;
    playbackRate: number;
    handleVolumeChange: (newVolume: number) => void;
    handlePlaybackRateChange: (newRate: number) => void;
};
