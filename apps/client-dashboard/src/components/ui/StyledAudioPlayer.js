import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) {
        return '00:00';
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
const StyledAudioPlayer = ({ isPlaying, isLoading, currentTime, duration, volume, voiceName, voiceDescription, onPlayPause, onSeek, onVolumeChange, }) => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const handleSeek = (e) => {
        if (duration === 0)
            return;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = progressBar.offsetWidth;
        const percentage = clickX / width;
        const newTime = duration * percentage;
        onSeek(newTime);
    };
    return (_jsxs("div", { className: "w-full max-w-md mx-auto bg-white rounded-lg p-5 flex flex-col space-y-4 border border-gray-200 shadow-sm", children: [_jsxs("div", { className: "flex flex-col items-start w-full", children: [voiceName && (_jsx("span", { className: "text-sm font-semibold text-gray-800 capitalize break-words w-full", children: voiceName })), voiceDescription && (_jsx("div", { className: "text-xs font-medium text-gray-500 capitalize mt-1", children: (() => {
                            const parts = voiceDescription.split(', ');
                            const lines = [];
                            for (let i = 0; i < parts.length; i += 3) {
                                lines.push(parts.slice(i, i + 3).join(', '));
                            }
                            return lines.map((line, index) => (_jsx("span", { className: "block", children: line }, index)));
                        })() }))] }), _jsxs("div", { className: "flex items-center space-x-4 w-full", children: [_jsx("span", { className: "text-sm text-gray-600 font-mono w-12 min-w-[3rem] text-center", children: formatTime(currentTime) }), _jsxs("div", { className: "w-full bg-gray-200 rounded-full h-2 relative cursor-pointer group", onClick: handleSeek, children: [_jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${progress}%` } }), _jsx("div", { className: "absolute top-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full transform -translate-y-1/2 group-hover:scale-110 transition-transform", style: { left: `calc(${progress}% - 8px)` } })] }), _jsx("span", { className: "text-sm text-gray-600 font-mono w-12 min-w-[3rem] text-center", children: formatTime(duration) })] }), _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("div", { className: "flex-grow flex justify-center", children: _jsx("button", { onClick: onPlayPause, className: "w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-colors rounded-full text-white flex-shrink-0 shadow-lg", disabled: isLoading, children: isLoading ? (_jsx("div", { className: "animate-spin rounded-full h-7 w-7 border-b-2 border-white" })) : isPlaying ? (_jsx(PauseIcon, { className: "w-7 h-7" })) : (_jsx(PlayIcon, { className: "w-7 h-7" })) }) }), _jsxs("div", { className: "flex items-center space-x-3 justify-end", children: [_jsx("button", { onClick: () => onVolumeChange(volume > 0 ? 0 : 1), className: "text-gray-600 hover:text-gray-800", children: volume > 0 ? _jsx(SpeakerWaveIcon, { className: "w-6 h-6" }) : _jsx(SpeakerXMarkIcon, { className: "w-6 h-6" }) }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.05", value: volume, onChange: (e) => onVolumeChange(Number(e.target.value)), className: "w-28 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600" })] })] })] }));
};
export default StyledAudioPlayer;
