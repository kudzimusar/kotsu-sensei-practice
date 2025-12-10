import { useState, useEffect } from 'react';
import { Flashcard } from './Flashcard';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, X, Trophy, AlertCircle } from 'lucide-react';
import { FlashcardSession as SessionType } from '@/hooks/useFlashcards';

interface FlashcardSessionProps {
  session: SessionType;
  onAnswer: (isCorrect: boolean) => void;
  onComplete: () => void;
  onExit: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function FlashcardSession({ session, onAnswer, onComplete, onExit, onNext, onPrevious }: FlashcardSessionProps) {
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  
  const currentFlashcard = session.flashcards[session.currentIndex];
  const isAnswered = answeredCards.has(session.currentIndex);
  const hasResponse = session.responses.some(r => r.flashcardIndex === session.currentIndex);
  const progress = session.flashcards.length > 0 
    ? ((session.currentIndex + 1) / session.flashcards.length) * 100 
    : 0;

  useEffect(() => {
    if (session.currentIndex >= session.flashcards.length) {
      onComplete();
    }
  }, [session.currentIndex, session.flashcards.length, onComplete]);

  const handleAnswer = (isCorrect: boolean) => {
    if (!isAnswered && !hasResponse) {
      setAnsweredCards(new Set([...answeredCards, session.currentIndex]));
      onAnswer(isCorrect);
    }
  };

  const handleNext = () => {
    if (session.currentIndex < session.flashcards.length - 1) {
      onNext();
    } else if (isAnswered) {
      // Last card answered, trigger completion
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (session.currentIndex > 0) {
      onPrevious();
    }
  };

  if (session.currentIndex >= session.flashcards.length) {
    // Calculate accuracy based on answered cards only
    const totalAnswered = session.correctCount + session.incorrectCount;
    const correctPercentage = totalAnswered > 0
      ? Math.round((session.correctCount / totalAnswered) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-background p-5 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">Session Complete!</h2>
              <p className="text-muted-foreground">
                You answered {totalAnswered} of {session.flashcards.length} cards
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-white/80 dark:bg-background/80">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{session.correctCount}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
              </Card>
              <Card className="p-4 bg-white/80 dark:bg-background/80">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{session.incorrectCount}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-white/80 dark:bg-background/80 mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-1">{correctPercentage}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <Progress value={correctPercentage} className="mt-3 h-2" />
              </div>
            </Card>

            <div className="space-y-3">
              {session.incorrectCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
                  onClick={onExit}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Review Incorrect Cards ({session.incorrectCount})
                </Button>
              )}
              
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onExit}
              >
                New Session
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={onExit}
              >
                Back to Flashcards
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentFlashcard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-5 pb-24">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Exit
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            Card {session.currentIndex + 1} of {session.flashcards.length}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {/* Score indicator */}
        <div className="flex justify-center gap-4 mt-2 text-sm">
          <span className="text-green-600 font-medium">✓ {session.correctCount}</span>
          <span className="text-red-600 font-medium">✗ {session.incorrectCount}</span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto mb-6">
        <Flashcard
          flashcard={currentFlashcard}
          onAnswer={handleAnswer}
          showAnswer={isAnswered || hasResponse}
          isAnswered={isAnswered || hasResponse}
        />
      </div>

      {/* Navigation - Only show after answering */}
      {(isAnswered || hasResponse) && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={session.currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {session.currentIndex >= session.flashcards.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
