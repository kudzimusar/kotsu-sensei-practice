import { useState } from 'react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { FlashcardSession } from '@/components/FlashcardSession';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import { Loader2, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FLASHCARD_CATEGORIES = [
  {
    id: 'regulatory-signs',
    name: 'Regulatory Signs',
    nameJp: '規制標識',
    description: 'Stop, speed limits, no parking, one-way',
    icon: '🚦',
    count: 20,
  },
  {
    id: 'warning-signs',
    name: 'Warning Signs',
    nameJp: '警戒標識',
    description: 'Curves, intersections, school zones',
    icon: '⚠️',
    count: 15,
  },
  {
    id: 'indication-signs',
    name: 'Indication Signs',
    nameJp: '指示標識',
    description: 'Pedestrian crossings, safety zones',
    icon: '📍',
    count: 16,
  },
  {
    id: 'guidance-signs',
    name: 'Guidance Signs',
    nameJp: '案内標識',
    description: 'Direction and route information',
    icon: '🗺️',
    count: 22,
  },
  {
    id: 'road-markings',
    name: 'Road Markings',
    nameJp: '道路標示',
    description: 'Lane markings, painted signs',
    icon: '🛤️',
    count: 30,
  },
] as const;

const CARD_COUNTS = [10, 20, 30, 50] as const;

export default function Flashcards() {
  const { session, startSession, submitAnswer, goToNext, goToPrevious, resetSession, isLoading, error } = useFlashcards();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const handleStartSession = async () => {
    if (!selectedCategory) {
      toast({
        title: 'Select a category',
        description: 'Please choose a category to start practicing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await startSession(selectedCategory, selectedCount);
      toast({
        title: 'Session started!',
        description: `Starting ${selectedCount} flashcards on ${FLASHCARD_CATEGORIES.find(c => c.id === selectedCategory)?.name}`,
      });
    } catch (err) {
      toast({
        title: 'Error starting session',
        description: err instanceof Error ? err.message : 'Failed to start flashcard session',
        variant: 'destructive',
      });
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!session) return;

    const responseTime = 0; // Could track actual response time if needed
    const currentFlashcard = session.flashcards[session.currentIndex];
    
    submitAnswer(
      session.currentIndex,
      currentFlashcard.answer,
      isCorrect,
      responseTime
    );
  };

  const handleComplete = () => {
    if (!session) return;
    
    const correctPercentage = session.flashcards.length > 0
      ? Math.round((session.correctCount / session.flashcards.length) * 100)
      : 0;

    toast({
      title: 'Session complete! 🎉',
      description: `You got ${session.correctCount} out of ${session.flashcards.length} correct (${correctPercentage}%)`,
    });
  };

  const handleExit = () => {
    resetSession();
    setSelectedCategory(null);
  };

  // Show session if active
  if (session) {
    return (
      <FlashcardSession
        session={session}
        onAnswer={handleAnswer}
        onComplete={handleComplete}
        onExit={handleExit}
        onNext={goToNext}
        onPrevious={goToPrevious}
      />
    );
  }

  // Main flashcards page
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-5 py-4">
          <h1 className="text-xl font-bold">Practice Flashcards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Memorize road signs & markings
          </p>
        </div>
      </header>

      <main className="px-5 py-6">
        {/* Category Selection */}
        <section className="mb-8">
          <h2 className="font-bold text-lg mb-4">Choose Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FLASHCARD_CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'hover:border-blue-200'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.nameJp}</p>
                  {category.count > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{category.count} signs</p>
                  )}
                  {selectedCategory === category.id && (
                    <Badge className="mt-2 bg-blue-600">Selected</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Card Count Selection */}
        {selectedCategory && (
          <section className="mb-8">
            <h2 className="font-bold text-lg mb-4">Number of Cards</h2>
            <div className="flex gap-3 flex-wrap">
              {CARD_COUNTS.map((count) => {
                const categoryData = FLASHCARD_CATEGORIES.find(c => c.id === selectedCategory);
                const maxCount = categoryData?.count || 50;
                const availableCount = Math.min(count, maxCount);
                
                return (
                  <Button
                    key={count}
                    variant={selectedCount === count ? 'default' : 'outline'}
                    className={selectedCount === count ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => setSelectedCount(availableCount)}
                    disabled={count > maxCount && maxCount > 0}
                  >
                    {availableCount} Cards
                    {count > maxCount && maxCount > 0 && ` (max: ${maxCount})`}
                  </Button>
                );
              })}
            </div>
          </section>
        )}

        {/* Start Button */}
        {selectedCategory && (
          <section className="mb-8">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6"
              onClick={handleStartSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating flashcards...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Start Session
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-sm mb-2">How it works</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Select a category to practice</li>
            <li>• Choose how many cards you want</li>
            <li>• Tap cards to flip and see answers</li>
            <li>• Mark yourself as correct or incorrect</li>
            <li>• Review your performance at the end</li>
          </ul>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

