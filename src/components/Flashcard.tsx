import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ChevronRight, AlertCircle } from 'lucide-react';
import type { Flashcard as FlashcardData } from '@/hooks/useFlashcards';

interface FlashcardProps {
  flashcard: FlashcardData;
  onAnswer: (isCorrect: boolean) => void;
  onRevealComplete: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  'regulatory-signs': { label: 'Regulatory', className: 'bg-red-500/20 text-red-700 dark:text-red-300' },
  'warning-signs': { label: 'Warning', className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
  'indication-signs': { label: 'Indication', className: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  'guidance-signs': { label: 'Guidance', className: 'bg-green-500/20 text-green-700 dark:text-green-300' },
  'auxiliary-signs': { label: 'Auxiliary', className: 'bg-purple-500/20 text-purple-700 dark:text-purple-300' },
  'road-markings': { label: 'Road Marking', className: 'bg-orange-500/20 text-orange-700 dark:text-orange-300' },
  'traffic-signals': { label: 'Traffic Signal', className: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' },
};

type RevealState = 0 | 1 | 2;

export const Flashcard: React.FC<FlashcardProps> = ({
  flashcard,
  onAnswer,
  onRevealComplete,
}) => {
  const [revealState, setRevealState] = useState<RevealState>(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Reset state when flashcard changes
  useEffect(() => {
    setRevealState(0);
    setImageLoaded(false);
    setSelectedAnswer(null);
    setHasAnswered(false);
  }, [flashcard.id, flashcard.signName]);

  // Generate a TRUE/FALSE statement - memoized to prevent re-generation
  const { statement, isStatementTrue } = useMemo(() => {
    const signName = flashcard.signName || flashcard.answer || 'this sign';
    const showTrue = Math.random() > 0.5;
    
    if (showTrue) {
      return {
        statement: `This sign means: "${signName}"`,
        isStatementTrue: true
      };
    } else {
      const wrongStatements = [
        'No Parking', 'Speed Limit 50', 'One Way', 'No Entry', 'Stop',
        'Yield', 'Pedestrian Crossing', 'No U-Turn', 'Keep Left', 'No Overtaking'
      ].filter(s => s.toLowerCase() !== signName.toLowerCase());
      
      const wrongAnswer = wrongStatements[Math.floor(Math.random() * wrongStatements.length)] || 'Something else';
      return {
        statement: `This sign means: "${wrongAnswer}"`,
        isStatementTrue: false
      };
    }
  }, [flashcard.id, flashcard.signName, flashcard.answer]);

  const handleImageClick = () => {
    if (revealState === 0) {
      setRevealState(1);
    }
  };

  const handleAnswerSelect = (userAnswer: boolean) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(userAnswer);
    setHasAnswered(true);
    
    const isCorrect = userAnswer === isStatementTrue;
    onAnswer(isCorrect);
  };

  const handleShowExplanation = () => {
    setRevealState(2);
  };

  const handleNextCard = () => {
    onRevealComplete();
  };

  const isCorrectAnswer = selectedAnswer === isStatementTrue;
  const categoryConfig = flashcard.category ? CATEGORY_CONFIG[flashcard.category] : null;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-card border-border shadow-lg">
      <CardContent className="p-0">
        <div 
          className={`relative aspect-square bg-muted flex items-center justify-center ${revealState === 0 ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
        >
          {flashcard.imageUrl ? (
            <>
              <img
                src={flashcard.imageUrl}
                alt="Road sign"
                className={`max-h-full max-w-full object-contain p-4 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <AlertCircle className="h-12 w-12 mb-2" />
              <span>No image available</span>
            </div>
          )}
          
          {categoryConfig && (
            <Badge className={`absolute top-3 left-3 ${categoryConfig.className}`}>
              {categoryConfig.label}
            </Badge>
          )}
          
          {revealState === 0 && imageLoaded && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-center text-sm font-medium">
                Tap to reveal question
              </p>
            </div>
          )}
        </div>

        {revealState === 1 && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Is this statement TRUE or FALSE?
              </h3>
              <p className="text-xl text-foreground font-medium bg-muted p-4 rounded-lg">
                {statement}
              </p>
            </div>

            {!hasAnswered ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-lg font-semibold border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                  onClick={() => handleAnswerSelect(true)}
                >
                  <Check className="mr-2 h-5 w-5" />
                  TRUE
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-lg font-semibold border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => handleAnswerSelect(false)}
                >
                  <X className="mr-2 h-5 w-5" />
                  FALSE
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg text-center ${isCorrectAnswer ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isCorrectAnswer ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <X className="h-6 w-6 text-red-600" />
                    )}
                    <span className={`text-xl font-bold ${isCorrectAnswer ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrectAnswer ? 'CORRECT!' : 'INCORRECT'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The statement was <strong>{isStatementTrue ? 'TRUE' : 'FALSE'}</strong>.
                    {!isStatementTrue && (
                      <span className="block mt-1">
                        This sign actually means: <strong>{flashcard.signName || flashcard.answer}</strong>
                      </span>
                    )}
                  </p>
                </div>

                <Button
                  className="w-full h-12"
                  onClick={handleShowExplanation}
                >
                  Learn More
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {revealState === 2 && (
          <div className="p-6 space-y-4">
            <div className="text-center border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">
                {flashcard.signName || flashcard.answer}
              </h2>
              {flashcard.signNameJp && (
                <p className="text-lg text-muted-foreground mt-1">
                  {flashcard.signNameJp}
                </p>
              )}
            </div>

            {flashcard.explanation && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Meaning</h4>
                <p className="text-muted-foreground">{flashcard.explanation}</p>
              </div>
            )}

            {flashcard.driverBehavior && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">What to Do</h4>
                <p className="text-muted-foreground">{flashcard.driverBehavior}</p>
              </div>
            )}

            {flashcard.legalContext && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Legal Context</h4>
                <p className="text-muted-foreground text-sm">{flashcard.legalContext}</p>
              </div>
            )}

            <Button
              className="w-full h-12 mt-4"
              onClick={handleNextCard}
            >
              Next Card
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export type { FlashcardData };
