import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, RotateCcw, Home } from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onHome: () => void;
}

const QuizResults = ({
  score,
  totalQuestions,
  onRestart,
  onHome,
}: QuizResultsProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 90;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 md:p-12 shadow-card bg-card text-center">
        <div className="mb-8">
          {passed ? (
            <div className="inline-flex p-6 rounded-full bg-gradient-success mb-4">
              <Trophy className="w-16 h-16 text-success-foreground" />
            </div>
          ) : (
            <div className="text-6xl mb-4">📚</div>
          )}
          
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-2">
            {passed ? "🎉 Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground">
            {passed
              ? "You passed the test! You're ready for the real exam."
              : "You need 90% or higher to pass. Review and try again!"}
          </p>
        </div>

        <div className="mb-8">
          <div className="inline-block p-8 bg-muted rounded-2xl border-2 border-border mb-4">
            <div className="text-6xl md:text-7xl font-bold text-card-foreground mb-2">
              {percentage}%
            </div>
            <div className="text-lg text-muted-foreground">
              {score} out of {totalQuestions} correct
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg mb-8 ${
          passed ? "bg-success/10 border-2 border-success" : "bg-error/10 border-2 border-error"
        }`}>
          <p className={`font-semibold ${passed ? "text-success" : "text-error"}`}>
            {passed
              ? "Excellent work! You demonstrated strong knowledge of Japanese traffic laws."
              : "Review the questions you missed and practice more to improve your score."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onRestart}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-button"
            size="lg"
          >
            <RotateCcw className="mr-2 w-5 h-5" />
            Try Again
          </Button>
          <Button
            onClick={onHome}
            variant="secondary"
            className="flex-1 shadow-button"
            size="lg"
          >
            <Home className="mr-2 w-5 h-5" />
            Home
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>💡 The real Japan driving test requires 90% or higher to pass</p>
        </div>
      </Card>
    </div>
  );
};

export default QuizResults;
