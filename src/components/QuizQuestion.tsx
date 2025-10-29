import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import type { Question } from "@/data/questions";

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

const QuizQuestion = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-6 md:p-8 shadow-card bg-card">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">{question.test}</p>
          <h2 className="text-xl md:text-2xl font-semibold text-card-foreground leading-relaxed">
            {question.question}
          </h2>
        </div>

        {question.figure && (
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-muted rounded-lg border-2 border-border">
              <img
                src={question.figure}
                alt="Road sign"
                className="max-w-[200px] max-h-[200px] object-contain"
              />
            </div>
          </div>
        )}

        {!showFeedback ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => handleAnswer(true)}
              className="flex-1 h-16 text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground shadow-button"
              size="lg"
            >
              TRUE
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              className="flex-1 h-16 text-lg font-semibold bg-error hover:bg-error/90 text-error-foreground shadow-button"
              size="lg"
            >
              FALSE
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card
              className={`p-6 border-2 ${
                isCorrect
                  ? "bg-success/10 border-success"
                  : "bg-error/10 border-error"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-error shrink-0 mt-1" />
                )}
                <div>
                  <p
                    className={`font-bold text-lg mb-2 ${
                      isCorrect ? "text-success" : "text-error"
                    }`}
                  >
                    {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                  </p>
                  <p className="text-sm text-card-foreground font-medium mb-1">
                    The correct answer is: <strong>{question.answer ? "TRUE" : "FALSE"}</strong>
                  </p>
                </div>
              </div>
              <div className="pl-9">
                <p className="text-sm text-card-foreground leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90 shadow-button"
              size="lg"
            >
              Next Question
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizQuestion;
