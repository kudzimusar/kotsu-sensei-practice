import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCw, ExternalLink, Info, AlertTriangle, Scale, Car } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

export interface FlashcardData {
  imageQuery?: string;
  question: string;
  answer: string;
  explanation: string;
  imageUrl: string | null;
  // Metadata from Wikimedia Commons
  roadSignImageId?: string;
  signNameEn?: string | null;
  signNameJp?: string | null;
  signCategory?: string | null;
  attributionText?: string | null;
  licenseInfo?: string | null;
  wikimediaPageUrl?: string | null;
  artistName?: string | null;
  imageSource?: string | null;
  // AI-enhanced fields
  aiEnhanced?: boolean;
  expandedMeaning?: string | null;
  driverBehavior?: string | null;
  legalContext?: string | null;
  translatedJapanese?: string | null;
  signNumber?: string | null;
}

interface FlashcardProps {
  flashcard: FlashcardData;
  onAnswer?: (isCorrect: boolean) => void;
  showAnswer?: boolean;
  isAnswered?: boolean;
}

// Category display names and colors
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  'regulatory': { label: 'Regulatory', color: 'bg-red-100 text-red-800 border-red-200' },
  'warning': { label: 'Warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'indication': { label: 'Indication', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'guidance': { label: 'Guidance', color: 'bg-green-100 text-green-800 border-green-200' },
  'auxiliary': { label: 'Auxiliary', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'road-markings': { label: 'Road Marking', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  'traffic-signals': { label: 'Traffic Signal', color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

export function Flashcard({ flashcard, onAnswer, showAnswer = false, isAnswered = false }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setImageLoaded(false);
  }, [flashcard.imageUrl, flashcard.question]);

  const handleFlip = () => {
    if (!isFlipped && !isAnswered) {
      setIsFlipped(true);
    }
  };

  const handleCorrect = () => {
    if (onAnswer && !isAnswered) {
      onAnswer(true);
    }
  };

  const handleIncorrect = () => {
    if (onAnswer && !isAnswered) {
      onAnswer(false);
    }
  };

  const categoryConfig = flashcard.signCategory 
    ? CATEGORY_CONFIG[flashcard.signCategory] || { label: flashcard.signCategory, color: 'bg-muted text-muted-foreground' }
    : null;

  return (
    <div className="w-full max-w-md mx-auto" style={{ perspective: '1000px' }}>
      <div
        className="relative w-full h-[560px] transition-transform duration-700 cursor-pointer"
        onClick={handleFlip}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 w-full h-full ${isFlipped ? 'pointer-events-none' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <Card className="w-full h-full p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            {!imageLoaded && flashcard.imageUrl && (
              <Skeleton className="w-full h-64 mb-4" />
            )}
            
            {flashcard.imageUrl ? (
              <div className="w-full mb-4">
                <div className="relative">
                  <img
                    src={flashcard.imageUrl}
                    alt={flashcard.question}
                    className={`w-full max-h-64 object-contain rounded-lg transition-opacity ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                    key={flashcard.imageUrl}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="w-full h-64 rounded-lg" />
                    </div>
                  )}
                  {/* Category badge */}
                  {categoryConfig && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className={`text-xs ${categoryConfig.color}`}>
                        {categoryConfig.label}
                      </Badge>
                    </div>
                  )}
                  {/* AI-enhanced badge */}
                  {flashcard.aiEnhanced && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                        AI Enhanced
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                <p className="text-muted-foreground text-sm">Loading image...</p>
              </div>
            )}

            <h3 className="text-lg font-bold text-center mb-2 text-card-foreground">
              {flashcard.question}
            </h3>
            
            <div className="mt-auto pt-4">
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4" />
                Tap to flip and see answer
              </p>
            </div>
          </Card>
        </div>

        {/* Back of card - Rich AI-enhanced content */}
        <div
          className={`absolute inset-0 w-full h-full ${!isFlipped ? 'pointer-events-none' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="w-full h-full p-5 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3">
              {/* Sign Name Header */}
              <div className="bg-white/90 rounded-lg p-3 border border-green-200">
                <div className="flex items-start gap-2 mb-1">
                  <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-green-800 text-base leading-tight">
                      {flashcard.signNameEn || flashcard.answer}
                    </p>
                    {flashcard.signNameJp && (
                      <p className="text-sm text-muted-foreground mt-1">
                        🇯🇵 {flashcard.signNameJp}
                        {flashcard.translatedJapanese && flashcard.translatedJapanese !== flashcard.signNameJp && (
                          <span className="text-xs ml-1">({flashcard.translatedJapanese})</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {categoryConfig && (
                        <Badge variant="outline" className={`text-xs ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </Badge>
                      )}
                      {flashcard.signNumber && (
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
                          #{flashcard.signNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meaning/Explanation */}
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-green-700 text-sm mb-1">📖 Meaning</p>
                <p className="text-sm text-card-foreground leading-relaxed">
                  {flashcard.expandedMeaning || flashcard.explanation}
                </p>
              </div>

              {/* Driver Behavior - Only show if available */}
              {flashcard.driverBehavior && (
                <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-blue-700 text-sm">What to Do</p>
                  </div>
                  <p className="text-sm text-card-foreground leading-relaxed">
                    {flashcard.driverBehavior}
                  </p>
                </div>
              )}

              {/* Legal Context - Only show if available */}
              {flashcard.legalContext && (
                <div className="bg-amber-50/80 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <p className="font-semibold text-amber-700 text-sm">Legal</p>
                  </div>
                  <p className="text-xs text-card-foreground leading-relaxed">
                    {flashcard.legalContext}
                  </p>
                </div>
              )}

              {/* Attribution footer */}
              {flashcard.imageSource === 'wikimedia_commons' && flashcard.attributionText && (
                <div className="bg-gray-50/80 rounded-lg p-2 border border-gray-200">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {flashcard.attributionText}
                  </p>
                  {flashcard.wikimediaPageUrl && (
                    <a
                      href={flashcard.wikimediaPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Wikimedia Commons
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {!isAnswered && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-green-200">
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncorrect();
                  }}
                >
                  Try Again
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCorrect();
                  }}
                >
                  Got it!
                </Button>
              </div>
            )}

            {isAnswered && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  Tap to flip back
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
