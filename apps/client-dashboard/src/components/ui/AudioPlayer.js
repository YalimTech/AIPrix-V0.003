import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, } from '@heroicons/react/24/outline';
const AudioPlayer = ({ src, title, className = '' }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio)
            return;
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const handleError = () => {
            setError('Error al cargar el audio');
            setIsLoading(false);
        };
        const handleCanPlay = () => {
            setIsLoading(false);
        };
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [src]);
    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio)
            return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        else {
            audio.play();
            setIsPlaying(true);
        }
    };
    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio)
            return;
        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };
    const handleVolumeChange = (e) => {
        const audio = audioRef.current;
        if (!audio)
            return;
        const newVolume = parseFloat(e.target.value);
        audio.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };
    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio)
            return;
        if (isMuted) {
            audio.volume = volume;
            setIsMuted(false);
        }
        else {
            audio.volume = 0;
            setIsMuted(true);
        }
    };
    const formatTime = (time) => {
        if (isNaN(time))
            return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    if (error) {
        return (_jsx("div", { className: `bg-red-50 border border-red-200 rounded-lg p-4 ${className}`, children: _jsx("p", { className: "text-red-600 text-sm", children: error }) }));
    }
    return (_jsxs("div", { className: `bg-white border border-gray-200 rounded-lg p-4 ${className}`, children: [_jsx("audio", { ref: audioRef, src: src, preload: "metadata" }), title && (_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-3 truncate", children: title })), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: togglePlayPause, disabled: isLoading, className: "flex-shrink-0 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? (_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" })) : isPlaying ? (_jsx(PauseIcon, { className: "w-4 h-4" })) : (_jsx(PlayIcon, { className: "w-4 h-4" })) }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-xs text-gray-500 w-10", children: formatTime(currentTime) }), _jsx("input", { type: "range", min: "0", max: duration || 0, value: currentTime, onChange: handleSeek, className: "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider", disabled: isLoading }), _jsx("span", { className: "text-xs text-gray-500 w-10", children: formatTime(duration) })] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: toggleMute, className: "p-1 text-gray-500 hover:text-gray-700", children: isMuted ? (_jsx(SpeakerXMarkIcon, { className: "w-4 h-4" })) : (_jsx(SpeakerWaveIcon, { className: "w-4 h-4" })) }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: isMuted ? 0 : volume, onChange: handleVolumeChange, className: "w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" })] })] }), _jsx("style", { children: `
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      ` })] }));
};
export default AudioPlayer;
