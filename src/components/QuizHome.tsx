import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { testCategories } from "@/data/questions";
import { useState } from "react";

type QuizMode = 'quick' | 'focused' | 'full';

interface QuizHomeProps {
  onStartQuiz: (mode: QuizMode, category?: string) => void;
}

const QuizHome = ({ onStartQuiz }: QuizHomeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModes, setShowModes] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowModes(true);
  };

  const handleModeSelect = (mode: QuizMode) => {
    onStartQuiz(mode, selectedCategory || undefined);
  };

  const handleBack = () => {
    setShowModes(false);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-2xl space-y-3 md:space-y-4">
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
            🚗 Kōtsū Sensei
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Master Japan's Driving Test
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Practice with real test questions
          </p>
        </div>

        {!showModes ? (
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3 text-center">
              Choose Test Category
            </h2>

            {testCategories.map((category) => (
              <Card
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="p-3 md:p-4 cursor-pointer hover:bg-primary/5 transition-all transform hover:scale-[1.01] border-2 hover:border-primary"
              >
                <h3 className="font-medium text-xs md:text-sm text-left">
                  {category}
                </h3>
              </Card>
            ))}

            <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                ✨ Real exam questions • Instant feedback • Pass with 90%+
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="mb-1 md:mb-2 text-xs md:text-sm"
            >
              ← Back to Categories
            </Button>

            <h2 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2">
              {selectedCategory}
            </h2>
            <p className="text-xs text-muted-foreground mb-2 md:mb-3">
              Choose Practice Mode
            </p>

            <div className="space-y-2 md:space-y-3">
              <Button
                onClick={() => handleModeSelect('quick')}
                className="w-full text-sm md:text-base py-4 md:py-5 bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.01]"
              >
                Quick Quiz (10 Questions)
              </Button>

              <Button
                onClick={() => handleModeSelect('focused')}
                className="w-full text-sm md:text-base py-4 md:py-5 bg-accent hover:bg-accent/90 transition-all transform hover:scale-[1.01]"
                variant="secondary"
              >
                Focused Drill (20 Questions)
              </Button>

              <Button
                onClick={() => handleModeSelect('full')}
                className="w-full text-sm md:text-base py-4 md:py-5 bg-secondary hover:bg-secondary/90 transition-all transform hover:scale-[1.01]"
                variant="secondary"
              >
                Full Exam (50 Questions)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHome;
