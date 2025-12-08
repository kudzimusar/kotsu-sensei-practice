import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCw, ExternalLink, Info, Scale, Car, BookOpen } from 'lucide-react';
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
    setIsFlipped(showAnswer);
    setImageLoaded(false);
  }, [flashcard.imageUrl, flashcard.question, showAnswer]);

  const handleFlip = () => {
    if (!isAnswered) {
      setIsFlipped(!isFlipped);
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

  // Get display name - clean up for better readability
  const displayName = flashcard.signNameEn || flashcard.answer || 'Road Sign';
  
  // Get explanation text
  const explanationText = flashcard.expandedMeaning || flashcard.explanation || 
    `This is a ${categoryConfig?.label?.toLowerCase() || 'road'} sign used in Japan.`;

  return (
    <div className="w-full max-w-md mx-auto" style={{ perspective: '1000px' }}>
      <div
        className="relative w-full min-h-[520px] transition-transform duration-500 cursor-pointer"
        onClick={handleFlip}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card - Shows image and question */}
        <div
          className={`absolute inset-0 w-full h-full ${isFlipped ? 'pointer-events-none' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <Card className="w-full h-full p-6 flex flex-col items-center justify-between bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20">
            {/* Category badge */}
            {categoryConfig && (
              <div className="self-start mb-4">
                <Badge variant="outline" className={`text-xs ${categoryConfig.color}`}>
                  {categoryConfig.label}
                </Badge>
              </div>
            )}
            
            {/* Image container - single centered image */}
            <div className="flex-1 flex items-center justify-center w-full">
              {!imageLoaded && flashcard.imageUrl && (
                <Skeleton className="w-48 h-48 rounded-lg" />
              )}
              
              {flashcard.imageUrl ? (
                <img
                  src={flashcard.imageUrl}
                  alt="Road sign"
                  className={`max-w-[200px] max-h-[200px] w-auto h-auto object-contain transition-opacity ${
                    imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  key={flashcard.imageUrl}
                />
              ) : (
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">No image</p>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="mt-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {flashcard.question || "What does this sign mean?"}
              </h3>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <RotateCw className="w-4 h-4" />
                <span className="text-sm">Tap to see answer</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Back of card - Shows answer and explanation */}
        <div
          className={`absolute inset-0 w-full h-full ${!isFlipped ? 'pointer-events-none' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="w-full h-full p-5 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3">
              {/* Answer header */}
              <div className="bg-white/90 dark:bg-background/90 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-green-800 dark:text-green-200 text-lg leading-tight">
                      {displayName}
                    </h3>
                    {flashcard.signNameJp && (
                      <p className="text-sm text-muted-foreground mt-1">
                        🇯🇵 {flashcard.signNameJp}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {categoryConfig && (
                        <Badge variant="outline" className={`text-xs ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </Badge>
                      )}
                      {flashcard.signNumber && (
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          #{flashcard.signNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meaning/Explanation */}
              <div className="bg-white/80 dark:bg-background/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Meaning</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {explanationText}
                </p>
              </div>

              {/* Driver Behavior - Only show if available */}
              {flashcard.driverBehavior && (
                <div className="bg-blue-50/80 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">What to Do</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {flashcard.driverBehavior}
                  </p>
                </div>
              )}

              {/* Legal Context - Only show if available */}
              {flashcard.legalContext && (
                <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">Legal Note</p>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {flashcard.legalContext}
                  </p>
                </div>
              )}

              {/* Attribution footer */}
              {flashcard.attributionText && (
                <div className="bg-gray-50/80 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {flashcard.attributionText}
                  </p>
                  {flashcard.wikimediaPageUrl && (
                    <a
                      href={flashcard.wikimediaPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Wikimedia Commons
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!isAnswered && (
              <div className="flex gap-3 mt-4 pt-3 border-t border-green-200 dark:border-green-700">
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
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
              <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  Answered
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
