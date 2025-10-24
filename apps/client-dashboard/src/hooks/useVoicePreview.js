import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/api';
export const useVoicePreview = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentVoiceId, setCurrentVoiceId] = useState(null);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const gainNodeRef = useRef(null);
    const audioBufferRef = useRef(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    const cleanup = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        sourceRef.current = null;
        gainNodeRef.current = null;
        timerRef.current = null;
        setIsPlaying(false);
        setCurrentTime(0);
    };
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            if (audioContextRef.current) {
                const elapsedTime = audioContextRef.current.currentTime - startTimeRef.current;
                setCurrentTime(elapsedTime);
            }
        }, 100);
    };
    const pause = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPlaying(false);
    }, []);
    const play = useCallback((offset = 0) => {
        if (!audioBufferRef.current || !audioContextRef.current)
            return;
        cleanup();
        // Configurar nodos de audio
        const source = audioContextRef.current.createBufferSource();
        const gainNode = audioContextRef.current.createGain();
        source.buffer = audioBufferRef.current;
        source.playbackRate.value = playbackRate;
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        source.start(0, offset);
        source.onended = () => {
            if (sourceRef.current === source) {
                cleanup();
                setCurrentVoiceId(null);
            }
        };
        sourceRef.current = source;
        gainNodeRef.current = gainNode;
        startTimeRef.current = audioContextRef.current.currentTime - offset;
        setIsPlaying(true);
        startTimer();
    }, [playbackRate, volume]);
    const playPreview = useCallback(async (voiceId, language) => {
        if (isLoading)
            return;
        if (currentVoiceId === voiceId) {
            // It's the same voice, so just toggle play/pause
            if (isPlaying) {
                pause();
            }
            else {
                play(currentTime);
            }
            return;
        }
        // It's a new voice
        cleanup();
        setIsLoading(true);
        setError(null);
        setCurrentVoiceId(voiceId);
        try {
            console.log('🎵 Iniciando preview de voz:', { voiceId, language });
            // Generar preview dinámico en el idioma seleccionado
            const sampleText = {
                spanish: "Hola, así es como suena mi voz. Espero que te guste.",
                french: "Bonjour, voici comment ma voix sonne. J'espère que vous l'aimez.",
                german: "Hallo, so klingt meine Stimme. Ich hoffe, es gefällt Ihnen.",
                italian: "Ciao, ecco come suona la mia voce. Spero che ti piaccia.",
                portuguese: "Olá, é assim que minha voz soa. Espero que você goste.",
                default: "Hello, this is how my voice sounds. I hope you like it.",
            };
            const text = sampleText[language.toLowerCase()] || sampleText.default;
            // Generar preview con el texto en el idioma seleccionado
            const response = await apiClient.post('/integrations/elevenlabs/preview', { voiceId, text, modelId: 'eleven_multilingual_v2' }, { responseType: 'arraybuffer' });
            console.log('✅ Preview generado en idioma:', language, {
                size: response instanceof ArrayBuffer ? response.byteLength : 'N/A'
            });
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            // Decodificar el audio
            const audioBuffer = await audioContextRef.current.decodeAudioData(response);
            console.log('✅ Audio decodificado:', { duration: audioBuffer.duration });
            audioBufferRef.current = audioBuffer;
            setDuration(audioBuffer.duration);
            play();
        }
        catch (err) {
            console.error('❌ Error fetching or playing preview:', err);
            setError('Failed to load audio preview.');
            setCurrentVoiceId(null);
        }
        finally {
            setIsLoading(false);
        }
    }, [isLoading, currentVoiceId, isPlaying, currentTime, play, pause]);
    const seek = useCallback((time) => {
        if (time >= 0 && time <= duration) {
            pause();
            setCurrentTime(time);
            play(time);
        }
    }, [duration, pause, play]);
    const handleVolumeChange = useCallback((newVolume) => {
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVolume;
        }
    }, []);
    const handlePlaybackRateChange = useCallback((newRate) => {
        setPlaybackRate(newRate);
        if (sourceRef.current) {
            sourceRef.current.playbackRate.value = newRate;
        }
    }, []);
    useEffect(() => {
        return () => cleanup();
    }, []);
    return {
        playPreview,
        pause,
        seek,
        isPlaying,
        isLoading,
        error,
        duration,
        currentTime,
        currentVoiceId,
        volume,
        playbackRate,
        handleVolumeChange,
        handlePlaybackRateChange,
    };
};
