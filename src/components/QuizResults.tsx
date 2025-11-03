import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, RotateCcw, Home, ChevronRight, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

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
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const { t } = useTranslation();
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 90;

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 pb-24">
      <Card className="w-full max-w-2xl mx-auto p-6 md:p-10 shadow-card bg-card text-center">
        <div className="mb-6 md:mb-8">
          {passed ? (
            <div className="inline-flex p-4 md:p-5 rounded-full bg-gradient-success mb-3 md:mb-4">
              <Trophy className="w-12 h-12 md:w-14 md:h-14 text-success-foreground" />
            </div>
          ) : (
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">📚</div>
          )}
          
          <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-1.5 md:mb-2">
            {passed ? "🎉 " + t('quiz.passed', 'Congratulations!') : t('quiz.failed', 'Keep Practicing!')}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {passed
              ? t('quiz.passed', 'You passed the test!')
              : t('quiz.failed', 'Keep practicing! You\'ll get there.')}
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="inline-block p-6 md:p-8 bg-muted rounded-2xl border-2 border-border mb-3 md:mb-4">
            <div className="text-5xl md:text-6xl font-bold text-card-foreground mb-1.5 md:mb-2">
              {percentage}%
            </div>
            <div className="text-sm md:text-base text-muted-foreground">
              {t('quiz.your_score', 'Your Score')}: {score} / {totalQuestions}
            </div>
          </div>
        </div>

        <div className={`p-3 md:p-4 rounded-lg mb-6 md:mb-8 ${
          passed ? "bg-success/10 border-2 border-success" : "bg-error/10 border-2 border-error"
        }`}>
          <p className={`text-xs md:text-sm font-semibold ${passed ? "text-success" : "text-error"}`}>
            {passed
              ? "Excellent work! You demonstrated strong knowledge of Japanese traffic laws."
              : "Review the questions you missed and practice more to improve your score."}
          </p>
        </div>

        {isGuest && (
          <div className="p-4 rounded-lg mb-6 bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  {t('quiz.create_account', 'Save Your Progress!')}
                </p>
                <p className="text-xs text-blue-700 mb-3">
                  {t('quiz.create_account', 'Create an account to save your progress')}
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('quiz.sign_up_now', 'Sign Up Now')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            onClick={onRestart}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-button text-sm md:text-base py-5 md:py-6"
            size="lg"
          >
            <RotateCcw className="mr-2 w-4 h-4 md:w-5 md:h-5" />
            {t('quiz.try_again', 'Try Again')}
          </Button>
          <Button
            onClick={onHome}
            variant="secondary"
            className="flex-1 shadow-button text-sm md:text-base py-5 md:py-6"
            size="lg"
          >
            <Home className="mr-2 w-4 h-4 md:w-5 md:h-5" />
            {t('nav.home', 'Home')}
          </Button>
        </div>

        <div className="mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground">
          <p>💡 {t('quiz.test_requirement', 'The real Japan driving test requires 90% or higher to pass')}</p>
        </div>

        <Button
          onClick={() => navigate("/tests")}
          variant="ghost"
          className="mt-4 text-xs text-muted-foreground hover:text-foreground"
        >
          {t('quiz.view_results', 'View All Results')}
          <ChevronRight className="ml-1 w-3 h-3" />
        </Button>
      </Card>

      <BottomNav />
    </div>
  );
};

export default QuizResults;
