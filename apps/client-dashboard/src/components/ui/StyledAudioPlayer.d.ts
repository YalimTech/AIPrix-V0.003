import React from 'react';
interface StyledAudioPlayerProps {
    isPlaying: boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    voiceName?: string;
    voiceDescription?: string;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
}
declare const StyledAudioPlayer: React.FC<StyledAudioPlayerProps>;
export default StyledAudioPlayer;
