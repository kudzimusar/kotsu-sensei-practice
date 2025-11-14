import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { recordUsage, getRemainingChars, isLimitExceeded } from '@/lib/tts/usageTracker';
import { toast } from 'sonner';

interface TTSOptions {
  voiceId?: string;
  autoPlay?: boolean;
}

interface AudioCache {
  [key: string]: string; // text -> audio data URL
}

const DEFAULT_VOICE_ID = '445d65ed-a87f-4140-9820-daf6d4f0a200';

export const useTextToSpeech = (options: TTSOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<AudioCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentText(null);
    setError(null);
  }, []);

  const speak = useCallback(async (text: string, customOptions?: TTSOptions) => {
    if (!text || !text.trim()) {
      setError('No text provided');
      return;
    }

    // Check usage limit
    if (isLimitExceeded()) {
      const remaining = getRemainingChars();
      toast.error(`TTS limit exceeded. ${remaining} characters remaining this month.`);
      setError('Usage limit exceeded');
      return;
    }

    const trimmedText = text.trim();
    const voiceId = customOptions?.voiceId || options.voiceId || DEFAULT_VOICE_ID;

    // Check cache first
    const cacheKey = `${trimmedText}_${voiceId}`;
    if (cacheRef.current[cacheKey]) {
      const audioUrl = cacheRef.current[cacheKey];
      playAudio(audioUrl, trimmedText);
      return;
    }

    // Stop any currently playing audio
    stop();

    setIsLoading(true);
    setError(null);
    setCurrentText(trimmedText);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: trimmedText,
          voice_id: voiceId,
        },
        signal: abortControllerRef.current.signal,
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.audio_url) {
        throw new Error('No audio data received');
      }

      // Record usage
      const charactersUsed = data.characters_used || trimmedText.length;
      recordUsage(charactersUsed);

      // Cache the audio
      cacheRef.current[cacheKey] = data.audio_url;

      // Play the audio
      playAudio(data.audio_url, trimmedText);

      // Show warning if approaching limit
      const remaining = getRemainingChars();
      if (remaining < 2000) {
        toast.warning(`TTS usage: ${remaining} characters remaining this month.`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }

      console.error('TTS error:', err);
      const errorMessage = err.message || 'Failed to generate speech';
      setError(errorMessage);
      
      if (errorMessage.includes('limit exceeded') || errorMessage.includes('quota')) {
        toast.error('TTS service limit reached. Please try again later.');
      } else {
        toast.error('Failed to generate speech. Please try again.');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [options.voiceId, stop]);

  const playAudio = useCallback((audioUrl: string, text: string) => {
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlaying(true);
      setCurrentText(text);
    };

    audio.onpause = () => {
      setIsPlaying(false);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentText(null);
      audioRef.current = null;
    };

    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      setError('Failed to play audio');
      setIsPlaying(false);
      setCurrentText(null);
      audioRef.current = null;
      toast.error('Failed to play audio');
    };

    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
      setIsPlaying(false);
      setCurrentText(null);
      audioRef.current = null;
      toast.error('Failed to play audio. Please check your browser settings.');
    });
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying && currentText) {
      audioRef.current.play().catch((err) => {
        console.error('Error resuming audio:', err);
        toast.error('Failed to resume audio');
      });
    }
  }, [isPlaying, currentText]);

  const toggle = useCallback((text: string) => {
    if (isPlaying && currentText === text) {
      pause();
    } else if (currentText === text && !isPlaying) {
      resume();
    } else {
      speak(text);
    }
  }, [isPlaying, currentText, speak, pause, resume]);

  return {
    speak,
    stop,
    pause,
    resume,
    toggle,
    isPlaying,
    isLoading,
    error,
    currentText,
    remainingChars: getRemainingChars(),
  };
};

