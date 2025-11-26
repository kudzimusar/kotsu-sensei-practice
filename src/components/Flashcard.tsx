import { useState, useEffect } from 'react';
import { QuestionImage } from './QuestionImage';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCw, ZoomIn, ExternalLink, Info } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export interface FlashcardData {
  imageQuery: string;
  question: string;
  answer: string;
  explanation: string;
  imageUrl: string | null;
  // Metadata from Wikimedia Commons (optional)
  roadSignImageId?: string;
  signNameEn?: string | null;
  signNameJp?: string | null;
  signCategory?: string | null;
  attributionText?: string | null;
  licenseInfo?: string | null;
  wikimediaPageUrl?: string | null;
  artistName?: string | null;
  imageSource?: string | null;
}

interface FlashcardProps {
  flashcard: FlashcardData;
  onAnswer?: (isCorrect: boolean) => void;
  showAnswer?: boolean;
  isAnswered?: boolean;
}

export function Flashcard({ flashcard, onAnswer, showAnswer = false, isAnswered = false }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset state when flashcard changes (new card loaded)
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

  return (
    <div className="w-full max-w-md mx-auto" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-[500px] transition-transform duration-700 cursor-pointer ${
          isFlipped ? '' : ''
        }`}
        onClick={handleFlip}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 w-full h-full ${
            isFlipped ? 'pointer-events-none' : ''
          }`}
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
                    onError={() => {
                      setImageLoaded(true); // Still mark as loaded even on error
                    }}
                    key={flashcard.imageUrl} // Force reload on URL change
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="w-full h-64 rounded-lg" />
                    </div>
                  )}
                  {/* Wikimedia Commons badge */}
                  {flashcard.imageSource === 'wikimedia_commons' && (
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 border border-gray-200">
                      <p className="text-[10px] text-gray-600 font-medium">Wikimedia</p>
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

        {/* Back of card */}
        <div
          className={`absolute inset-0 w-full h-full ${
            !isFlipped ? 'pointer-events-none' : ''
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="w-full h-full p-6 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-bold mb-3 text-card-foreground">
                {flashcard.question}
              </h3>
              
              {/* Sign name display (if available) */}
              {(flashcard.signNameEn || flashcard.signNameJp) && (
                <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700">Sign Information</p>
                  </div>
                  {flashcard.signNameEn && (
                    <p className="text-sm text-card-foreground font-medium">
                      {flashcard.signNameEn}
                    </p>
                  )}
                  {flashcard.signNameJp && (
                    <p className="text-xs text-muted-foreground">
                      {flashcard.signNameJp}
                    </p>
                  )}
                  {flashcard.signCategory && (
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      Category: {flashcard.signCategory.replace('-', ' ')}
                    </p>
                  )}
                </div>
              )}
              
              <div className="bg-white/80 rounded-lg p-4 mb-4">
                <p className="font-semibold text-green-700 mb-2">Answer:</p>
                <p className="text-base text-card-foreground mb-3">
                  {flashcard.answer}
                </p>
              </div>

              <div className="bg-white/80 rounded-lg p-4 mb-4">
                <p className="font-semibold text-green-700 mb-2">Explanation:</p>
                <p className="text-sm text-card-foreground whitespace-pre-wrap">
                  {flashcard.explanation}
                </p>
              </div>

              {/* Attribution footer (Wikimedia Commons only) */}
              {flashcard.imageSource === 'wikimedia_commons' && flashcard.attributionText && (
                <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-200">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {flashcard.attributionText}
                  </p>
                  {flashcard.wikimediaPageUrl && (
                    <a
                      href={flashcard.wikimediaPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on Wikimedia Commons
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {!isAnswered && (
              <div className="flex gap-3 mt-auto pt-4">
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
              <div className="mt-auto pt-4">
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

