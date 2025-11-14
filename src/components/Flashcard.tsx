import { useState } from 'react';
import { QuestionImage } from './QuestionImage';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCw, ZoomIn } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export interface FlashcardData {
  imageQuery: string;
  question: string;
  answer: string;
  explanation: string;
  imageUrl: string | null;
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
                    className="w-full max-h-64 object-contain rounded-lg"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
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
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3 text-card-foreground">
                {flashcard.question}
              </h3>
              
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

