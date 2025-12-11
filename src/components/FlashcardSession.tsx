import React, { useState, useEffect } from 'react';
import { Flashcard } from './Flashcard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, X, Trophy, Target } from 'lucide-react';
import type { FlashcardSession as FlashcardSessionType } from '@/hooks/useFlashcards';

interface FlashcardSessionProps {
  session: FlashcardSessionType;
  onAnswer: (isCorrect: boolean) => void;
  onComplete: () => void;
  onExit: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const FlashcardSession: React.FC<FlashcardSessionProps> = ({
  session,
  onAnswer,
  onComplete,
  onExit,
  onNext,
  onPrevious,
}) => {
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  
  const currentFlashcard = session.flashcards[session.currentIndex];
  const totalCards = session.flashcards.length;
  const answeredCount = answeredCards.size;
  const correctCount = session.correctCount;
  const incorrectCount = session.incorrectCount;
  const progress = (answeredCount / totalCards) * 100;
  const isComplete = session.currentIndex >= totalCards;

  // Call onComplete when session ends
  useEffect(() => {
    if (isComplete && answeredCount > 0) {
      onComplete();
    }
  }, [isComplete, answeredCount, onComplete]);

  const handleAnswer = (isCorrect: boolean) => {
    if (currentFlashcard) {
      setAnsweredCards(prev => {
        const newSet = new Set(prev);
        newSet.add(session.currentIndex);
        return newSet;
      });
      onAnswer(isCorrect);
    }
  };

  const handleRevealComplete = () => {
    onNext();
  };

  const handleRestart = () => {
    setAnsweredCards(new Set());
    // Navigate back to first card - handled by parent
    onExit();
  };

  // Session complete screen
  if (isComplete || !currentFlashcard) {
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const isPassing = accuracy >= 70;

    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isPassing ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                <Trophy className={`h-10 w-10 ${isPassing ? 'text-green-500' : 'text-orange-500'}`} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isPassing ? 'Great Job!' : 'Keep Practicing!'}
              </h2>
              <p className="text-muted-foreground mt-2">
                You've completed this session
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">{answeredCount}</p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">{accuracy}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRestart}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Session
              </Button>
              <Button
                className="flex-1"
                onClick={onExit}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCurrentCardAnswered = answeredCards.has(session.currentIndex);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header with progress */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Exit
          </Button>
          
          <div className="text-center">
            <span className="text-sm font-medium text-foreground">
              {session.currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">{correctCount} ✓</span>
            <span className="text-red-600 font-medium">{incorrectCount} ✗</span>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2" />

        {/* Flashcard */}
        <Flashcard
          flashcard={currentFlashcard}
          onAnswer={handleAnswer}
          onRevealComplete={handleRevealComplete}
        />

        {/* Navigation - only show if card has been answered */}
        {isCurrentCardAnswered && (
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={session.currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={session.currentIndex === totalCards - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardSession;
