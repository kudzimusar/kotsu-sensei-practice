import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Info, Scale, Car, BookOpen, Check, X } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import type { Flashcard as FlashcardType } from '@/hooks/useFlashcards';

interface FlashcardProps {
  flashcard: FlashcardType;
  onAnswer?: (isCorrect: boolean) => void;
  showAnswer?: boolean;
  isAnswered?: boolean;
}

// Category display names and colors
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  'regulatory': { label: 'Regulatory', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300' },
  'warning': { label: 'Warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'indication': { label: 'Indication', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
  'guidance': { label: 'Guidance', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300' },
  'auxiliary': { label: 'Auxiliary', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
  'road-markings': { label: 'Road Marking', color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300' },
  'traffic-signals': { label: 'Traffic Signal', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300' },
};

export function Flashcard({ flashcard, onAnswer, showAnswer = false, isAnswered = false }: FlashcardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  // The correct answer for this flashcard (default to true if not specified)
  const correctAnswer = flashcard.answer?.toLowerCase() === 'false' ? false : true;

  useEffect(() => {
    setImageLoaded(false);
    setUserAnswer(null);
    setShowResult(false);
  }, [flashcard.imageUrl, flashcard.question]);

  // If already answered externally, show the result
  useEffect(() => {
    if (showAnswer || isAnswered) {
      setShowResult(true);
    }
  }, [showAnswer, isAnswered]);

  const handleUserAnswer = (answer: boolean) => {
    if (isAnswered || showResult) return;
    
    setUserAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === correctAnswer;
    if (onAnswer) {
      onAnswer(isCorrect);
    }
  };

  const categoryConfig = flashcard.category 
    ? CATEGORY_CONFIG[flashcard.category] || { label: flashcard.category, color: 'bg-muted text-muted-foreground' }
    : null;

  const displayName = flashcard.signName || 'Road Sign';
  const explanationText = flashcard.explanation || 
    `This is a ${categoryConfig?.label?.toLowerCase() || 'road'} sign used in Japan.`;

  const userWasCorrect = userAnswer !== null && userAnswer === correctAnswer;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full p-6 flex flex-col bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20">
        {/* Category badge */}
        {categoryConfig && (
          <div className="self-start mb-4">
            <Badge variant="outline" className={`text-xs ${categoryConfig.color}`}>
              {categoryConfig.label}
            </Badge>
          </div>
        )}
        
        {/* Image container */}
        <div className="flex items-center justify-center w-full min-h-[180px]">
          {!imageLoaded && flashcard.imageUrl && (
            <Skeleton className="w-40 h-40 rounded-lg" />
          )}
          
          {flashcard.imageUrl ? (
            <img
              src={flashcard.imageUrl}
              alt="Road sign"
              className={`max-w-[180px] max-h-[180px] w-auto h-auto object-contain transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              key={flashcard.imageUrl}
            />
          ) : (
            <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No image</p>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {flashcard.question || "What does this sign mean?"}
          </h3>
        </div>

        {/* TRUE/FALSE Answer Buttons - Show when not answered yet */}
        {!showResult && (
          <div className="flex gap-4 mt-4">
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-6"
              onClick={() => handleUserAnswer(true)}
            >
              <Check className="w-5 h-5 mr-2" />
              TRUE
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-6"
              onClick={() => handleUserAnswer(false)}
            >
              <X className="w-5 h-5 mr-2" />
              FALSE
            </Button>
          </div>
        )}

        {/* Result - Show after answering */}
        {showResult && (
          <div className="mt-4 space-y-4">
            {/* Result Banner */}
            <div className={`p-4 rounded-lg text-center ${
              userWasCorrect 
                ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' 
                : 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {userWasCorrect ? (
                  <>
                    <Check className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-bold text-green-700 dark:text-green-300">CORRECT!</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6 text-red-600" />
                    <span className="text-lg font-bold text-red-700 dark:text-red-300">INCORRECT</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                The correct answer is: <strong>{correctAnswer ? 'TRUE' : 'FALSE'}</strong>
              </p>
            </div>

            {/* Answer Details */}
            <div className="bg-white/90 dark:bg-background/90 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg leading-tight">
                    {displayName}
                  </h3>
                  {flashcard.signNameJp && (
                    <p className="text-sm text-muted-foreground mt-1">
                      🇯🇵 {flashcard.signNameJp}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {flashcard.signNumber && (
                      <Badge variant="outline" className="text-xs bg-muted">
                        #{flashcard.signNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground text-sm">Explanation</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanationText}
              </p>
            </div>

            {/* Driver Behavior */}
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

            {/* Legal Context */}
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

            {/* Attribution */}
            {flashcard.attribution && (
              <div className="bg-muted/30 rounded-lg p-2 border border-border">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {flashcard.attribution}
                </p>
                {flashcard.wikimediaUrl && (
                  <a
                    href={flashcard.wikimediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                  >
                    Wikimedia Commons
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export type { FlashcardType as FlashcardData };
