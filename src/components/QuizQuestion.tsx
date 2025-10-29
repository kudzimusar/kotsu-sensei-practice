import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ChevronRight, X } from "lucide-react";
import type { Question } from "@/data/questions";

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  onQuit: () => void;
}

const QuizQuestion = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onQuit,
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const isCorrect = answer === question.answer;
    onAnswer(isCorrect);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    onNext();
  };

  const progress = (questionNumber / totalQuestions) * 100;
  const isCorrect = selectedAnswer === question.answer;

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 pb-24">
      <Card className="w-full max-w-3xl mx-auto p-4 md:p-6 shadow-card bg-card">
        <div className="mb-4 md:mb-5">
          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <button
              onClick={onQuit}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs md:text-sm"
            >
              <X className="w-4 h-4" />
              Quit
            </button>
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-xs md:text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5 md:h-2" />
        </div>

        <div className="mb-4 md:mb-5">
          <p className="text-xs text-muted-foreground mb-1.5 md:mb-2">{question.test}</p>
          <h2 className="text-sm md:text-base leading-snug md:leading-relaxed font-medium text-card-foreground">
            {question.question}
          </h2>
        </div>

        {question.figure && (
          <div className="mb-4 md:mb-5 flex justify-center">
            <div className="p-3 md:p-4 bg-muted rounded-lg border-2 border-border">
              <img
                src={question.figure}
                alt="Road sign"
                className="max-w-[140px] md:max-w-[180px] max-h-[140px] md:max-h-[180px] object-contain"
              />
            </div>
          </div>
        )}

        {!showFeedback ? (
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button
              onClick={() => handleAnswer(true)}
              className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground shadow-button"
              size="lg"
            >
              TRUE
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold bg-error hover:bg-error/90 text-error-foreground shadow-button"
              size="lg"
            >
              FALSE
            </Button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            <Card
              className={`p-3 md:p-4 border-2 ${
                isCorrect
                  ? "bg-success/10 border-success"
                  : "bg-error/10 border-error"
              }`}
            >
              <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 md:w-6 md:h-6 text-error shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-bold text-sm md:text-base mb-1 md:mb-1.5 ${
                      isCorrect ? "text-success" : "text-error"
                    }`}
                  >
                    {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                  </p>
                  <p className="text-xs md:text-sm text-card-foreground font-medium mb-0.5 md:mb-1">
                    The correct answer is: <strong>{question.answer ? "TRUE" : "FALSE"}</strong>
                  </p>
                </div>
              </div>
              <div className="pl-7 md:pl-9">
                <p className="text-xs md:text-sm text-card-foreground leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90 shadow-button text-sm md:text-base py-5 md:py-6"
              size="lg"
            >
              Next Question
              <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizQuestion;
