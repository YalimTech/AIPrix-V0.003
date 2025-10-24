import React from 'react';
interface AudioPlayerWidgetProps {
    audioUrl: string;
    title?: string;
    duration?: number;
    className?: string;
    onPlay?: () => void;
    onPause?: () => void;
    onEnd?: () => void;
}
declare const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps>;
export default AudioPlayerWidget;
