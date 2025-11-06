import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ZoomIn } from 'lucide-react';

interface QuestionImageProps {
  imageUrl: string;
  imageType: 'sign' | 'scenario' | 'none';
  alt: string;
}

export function QuestionImage({ imageUrl, imageType, alt }: QuestionImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  if (!imageUrl || imageType === 'none') return null;

  // For static signs, use direct import
  const isStatic = imageUrl.startsWith('/') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
  
  // For Supabase images, add optimization params
  const optimizedUrl = isStatic && !imageUrl.includes('?')
    ? imageUrl 
    : imageUrl.includes('?')
    ? imageUrl
    : `${imageUrl}?width=800&quality=85`;
  
  const thumbnailUrl = isStatic && !imageUrl.includes('?')
    ? imageUrl
    : imageUrl.includes('?')
    ? imageUrl
    : `${imageUrl}?width=400&quality=75`;

  return (
    <>
      <div className="relative mb-4 md:mb-5 flex justify-center group">
        <div 
          className={`relative p-3 md:p-4 bg-muted rounded-lg border-2 border-border cursor-zoom-in transition-all hover:border-primary ${
            imageType === 'sign' ? 'max-w-[200px]' : 'max-w-full'
          }`}
          onClick={() => setIsFullscreen(true)}
        >
          {isLoading && (
            <Skeleton className="absolute inset-0 rounded-lg" />
          )}
          
          {error ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">Image failed to load</p>
            </div>
          ) : (
            <img
              src={thumbnailUrl}
              alt={alt}
              className={`${
                imageType === 'sign' 
                  ? 'max-w-[140px] md:max-w-[180px] max-h-[140px] md:max-h-[180px]' 
                  : 'max-w-full max-h-[300px] md:max-h-[400px]'
              } object-contain transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsLoading(false)}
              onError={() => setError(true)}
              loading="lazy"
            />
          )}
          
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-foreground" />
          </div>
        </div>
      </div>

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2">
          <img
            src={optimizedUrl}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
