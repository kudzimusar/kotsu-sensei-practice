import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCw, ExternalLink, Info, Scale, Car, BookOpen, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import type { Flashcard as FlashcardType } from '@/hooks/useFlashcards';

interface FlashcardProps {
  flashcard: FlashcardType;
  onAnswer?: (isCorrect: boolean) => void;
  showAnswer?: boolean;
  isAnswered?: boolean;
  wrongAnswer?: string; // Wrong answer choice for reveal 2
  onRevealComplete?: () => void; // Called after reveal 3 to advance to next card
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

// Reveal states: 0 = image only, 1 = two choices, 2 = full metadata
type RevealState = 0 | 1 | 2;

export function Flashcard({ 
  flashcard, 
  onAnswer, 
  showAnswer = false, 
  isAnswered = false,
  wrongAnswer,
  onRevealComplete
}: FlashcardProps) {
  const [revealState, setRevealState] = useState<RevealState>(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Reset state when flashcard changes
  useEffect(() => {
    setRevealState(0);
    setImageLoaded(false);
    setSelectedChoice(null);
    setIsValidated(false);
  }, [flashcard.id]);

  // Handle click progression through reveals
  const handleClick = () => {
    if (revealState === 0) {
      // Move to reveal 2: show two answer choices
      setRevealState(1);
    } else if (revealState === 1 && selectedChoice && isValidated) {
      // Move to reveal 3: show full metadata
      setRevealState(2);
      // Auto-advance to next card after a brief delay
      if (onRevealComplete) {
        setTimeout(() => {
          onRevealComplete();
        }, 2000); // 2 second delay to read metadata
      }
    }
  };

  // Handle answer choice selection (reveal 2)
  const handleChoiceSelect = (choice: string) => {
    if (isValidated) return; // Prevent re-selection after validation
    
    setSelectedChoice(choice);
    const isCorrect = choice === flashcard.signName;
    setIsValidated(true);
    
    // Record answer
    if (onAnswer) {
      onAnswer(isCorrect);
    }
  };

  // Generate wrong answer if not provided
  const getWrongAnswer = (): string => {
    if (wrongAnswer) return wrongAnswer;
    
    // Fallback wrong answers based on category
    const wrongAnswers: Record<string, string[]> = {
      'regulatory': ['No Entry', 'No Parking', 'Stop', 'Yield', 'One-Way'],
      'warning': ['Curve Ahead', 'Intersection', 'School Zone', 'Railway Crossing', 'Slippery Road'],
      'indication': ['Pedestrian Crossing', 'Safety Zone', 'Bicycle Crossing', 'Parking Area'],
      'guidance': ['Direction Sign', 'Route Marker', 'Distance Marker', 'Destination Sign'],
      'auxiliary': ['Time Restriction', 'Distance Plate', 'Direction Plate', 'Vehicle Type'],
    };
    
    const categoryWrongs = wrongAnswers[flashcard.category || 'regulatory'] || ['Road Sign', 'Traffic Sign'];
    // Return a random wrong answer that's not the correct one
    const filtered = categoryWrongs.filter(a => a !== flashcard.signName);
    return filtered[Math.floor(Math.random() * filtered.length)] || 'Road Sign';
  };

  const wrongAnswerChoice = getWrongAnswer();
  const correctAnswer = flashcard.signName;
  
  // Shuffle the two choices
  const choices = [correctAnswer, wrongAnswerChoice].sort(() => Math.random() - 0.5);

  const categoryConfig = flashcard.category 
    ? CATEGORY_CONFIG[flashcard.category] || { label: flashcard.category, color: 'bg-muted text-muted-foreground' }
    : null;

  // Get display name
  const displayName = flashcard.signName || flashcard.answer || 'Road Sign';
  
  // Get explanation text
  const explanationText = flashcard.explanation || 
    `This is a ${categoryConfig?.label?.toLowerCase() || 'road'} sign used in Japan.`;

  // REVEAL 1: Image only with prompt
  if (revealState === 0) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card 
          className="w-full min-h-[520px] p-6 flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20 cursor-pointer transition-all hover:shadow-lg"
          onClick={handleClick}
        >
          {/* Image container - centered */}
          <div className="flex-1 flex items-center justify-center w-full mb-6">
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

          {/* Prompt */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground mb-4">
              What does this image mean?
            </h3>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RotateCw className="w-4 h-4" />
              <span className="text-sm">Tap to continue</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // REVEAL 2: Two answer choices
  if (revealState === 1) {
    const isCorrect = selectedChoice === correctAnswer;
    
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full min-h-[520px] p-6 flex flex-col bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20">
          {/* Image (still visible) */}
          <div className="flex items-center justify-center w-full mb-6">
            {flashcard.imageUrl ? (
              <img
                src={flashcard.imageUrl}
                alt="Road sign"
                className="max-w-[150px] max-h-[150px] w-auto h-auto object-contain"
              />
            ) : (
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-xs">No image</p>
              </div>
            )}
          </div>

          {/* Question */}
          <h3 className="text-lg font-bold text-foreground mb-6 text-center">
            What does this sign mean?
          </h3>

          {/* Two answer choices */}
          <div className="space-y-3 mb-6">
            {choices.map((choice, index) => {
              const isSelected = selectedChoice === choice;
              const isThisCorrect = choice === correctAnswer;
              const showFeedback = isValidated && isSelected;
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full py-6 text-base font-semibold transition-all ${
                    showFeedback
                      ? isThisCorrect
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-700"
                        : "bg-red-600 hover:bg-red-700 text-white border-red-700"
                      : isSelected
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={isValidated}
                >
                  <div className="flex items-center justify-center gap-2">
                    {showFeedback && (
                      isThisCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )
                    )}
                    <span>{choice}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Validation feedback */}
          {isValidated && (
            <div className={`p-4 rounded-lg mb-4 ${
              isCorrect 
                ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700"
                : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700"
            }`}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`font-semibold ${
                  isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                }`}>
                  {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                </p>
              </div>
              {!isCorrect && (
                <p className="text-sm text-muted-foreground mt-2">
                  The correct answer is: <strong>{correctAnswer}</strong>
                </p>
              )}
            </div>
          )}

          {/* Continue button (only after validation) */}
          {isValidated && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
              onClick={handleClick}
            >
              Continue to Learn More
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // REVEAL 3: Full metadata (mandatory)
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full min-h-[520px] p-5 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700 overflow-hidden">
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
          {flashcard.attribution && (
            <div className="bg-gray-50/80 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {flashcard.attribution}
              </p>
              {flashcard.wikimediaUrl && (
                <a
                  href={flashcard.wikimediaUrl}
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

        {/* Auto-advance indicator */}
        <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin" />
            Moving to next card...
          </p>
        </div>
      </Card>
    </div>
  );
}

// Re-export type for compatibility
export type { FlashcardType as FlashcardData };
