import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
  autoPlay?: boolean;
}

const TTS_ENABLED_KEY = 'tts_enabled';

export const TTSButton = ({
  text,
  className,
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
  autoPlay = false,
}: TTSButtonProps) => {
  const { toggle, isPlaying, isLoading, currentText, error } = useTextToSpeech();
  
  // Check if TTS is enabled (check localStorage directly - fast operation)
  const [isTtsEnabled, setIsTtsEnabled] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    const enabled = localStorage.getItem(TTS_ENABLED_KEY);
    return enabled !== 'false'; // Default to enabled
  });
  
  // Re-check when component mounts or window storage event fires
  React.useEffect(() => {
    const checkEnabled = () => {
      if (typeof window === 'undefined') return;
      const enabled = localStorage.getItem(TTS_ENABLED_KEY);
      setIsTtsEnabled(enabled !== 'false');
    };
    
    // Check on mount
    checkEnabled();
    
    // Listen for storage changes (when settings are updated in another tab/window)
    window.addEventListener('storage', checkEnabled);
    
    // Also check periodically (in case settings changed in same window)
    const interval = setInterval(checkEnabled, 1000);
    
    return () => {
      window.removeEventListener('storage', checkEnabled);
      clearInterval(interval);
    };
  }, []);

  const isActive = isPlaying && currentText === text;
  const isDisabled = !isTtsEnabled || isLoading || !!error || !text?.trim();
  
  // Don't render if TTS is disabled
  if (!isTtsEnabled) {
    return null;
  }

  const handleClick = () => {
    if (!isDisabled) {
      toggle(text);
    }
  };

  // Auto-play if enabled and text changes
  React.useEffect(() => {
    if (autoPlay && text && !isPlaying && !isLoading && !error && currentText !== text) {
      // Small delay to avoid auto-playing on every render
      const timer = setTimeout(() => {
        toggle(text);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]); // Only depend on text for auto-play

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={isDisabled}
            size={size}
            variant={variant}
            className={cn(
              'shrink-0',
              isActive && 'bg-primary text-primary-foreground',
              className
            )}
            aria-label={
              isActive
                ? 'Stop reading'
                : isLoading
                ? 'Loading audio...'
                : 'Read aloud'
            }
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {showLabel && (
              <span className="ml-2">
                {isActive ? 'Stop' : isLoading ? 'Loading...' : 'Read'}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isActive ? 'Stop reading' : isLoading ? 'Loading audio...' : 'Read aloud'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

