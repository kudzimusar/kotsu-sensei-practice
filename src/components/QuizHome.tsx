import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Zap, GraduationCap } from "lucide-react";

interface QuizHomeProps {
  onStartQuiz: (mode: 'quick' | 'focused' | 'full') => void;
}

const QuizHome = ({ onStartQuiz }: QuizHomeProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
            🚗 Kōtsū Sensei
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Master Japan's Driving Test
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Practice with real test questions and road signs
          </p>
        </div>

        <div className="grid gap-4 md:gap-6">
          <Card className="p-6 shadow-card hover:shadow-button transition-all duration-300 hover:-translate-y-1 border-2 border-border bg-card">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-primary shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">Quick Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  10 random questions to test your knowledge in just 5 minutes
                </p>
                <Button 
                  onClick={() => onStartQuiz('quick')}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-button"
                  size="lg"
                >
                  Start Quick Quiz
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-button transition-all duration-300 hover:-translate-y-1 border-2 border-border bg-card">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent shrink-0">
                <BookOpen className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">Focused Practice</h3>
                <p className="text-muted-foreground mb-4">
                  20 questions to build confidence and identify weak areas
                </p>
                <Button 
                  onClick={() => onStartQuiz('focused')}
                  variant="secondary"
                  className="w-full shadow-button"
                  size="lg"
                >
                  Start Practice
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-button transition-all duration-300 hover:-translate-y-1 border-2 border-primary bg-card">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-success shrink-0">
                <GraduationCap className="w-6 h-6 text-success-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">Full Exam Mode</h3>
                <p className="text-muted-foreground mb-4">
                  50 questions simulating the real test experience (90% to pass)
                </p>
                <Button 
                  onClick={() => onStartQuiz('full')}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground shadow-button"
                  size="lg"
                >
                  Take Full Exam
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>💡 Tip: Start with Quick Quiz to get familiar, then try the Full Exam</p>
        </div>
      </div>
    </div>
  );
};

export default QuizHome;
