import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface AudioPlayerWidgetProps {
  audioUrl: string;
  title?: string;
  duration?: number;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  audioUrl,
  title = 'Audio',
  duration,
  className = '',
  onPlay,
  onPause,
  onEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnd?.();
    };

    const handleError = () => {
      setError('Error al cargar el audio');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onPlay, onPause, onEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      setError('Error al reproducir el audio');
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progress = progressRef.current;
    if (!progress || !audioDuration) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioDuration;
    
    seek(newTime);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    seek(Math.min(currentTime + 10, audioDuration));
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    seek(Math.max(currentTime - 10, 0));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SpeakerWaveIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="spinner w-4 h-4"></div>
            <span>Cargando...</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          ref={progressRef}
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:h-3 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Main Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={skipBackward}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <BackwardIcon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            variant="primary"
            size="sm"
            className="px-4"
            disabled={isLoading || !!error}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            onClick={stop}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <StopIcon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={skipForward}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ForwardIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Waveform Visualization (Optional) */}
      {audioDuration > 0 && (
        <div className="mt-4">
          <div className="h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="w-1 bg-gray-300 rounded-full"
                  style={{
                    height: `${Math.random() * 20 + 8}px`,
                    backgroundColor: index / 20 <= progressPercentage / 100 ? '#3b82f6' : '#d1d5db'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerWidget;
