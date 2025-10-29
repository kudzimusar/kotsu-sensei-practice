import { useState } from "react";
import QuizHome from "@/components/QuizHome";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";
import { questions } from "@/data/questions";
import type { Question } from "@/data/questions";

type QuizMode = 'quick' | 'focused' | 'permit' | 'license';
type Screen = 'home' | 'quiz' | 'results';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [quizMode, setQuizMode] = useState<QuizMode>('quick');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  const getQuestionCount = (mode: QuizMode): number => {
    switch (mode) {
      case 'quick': return 10;
      case 'focused': return 20;
      case 'permit': return 50;
      case 'license': return 100;
    }
  };

  const getTimeLimit = (mode: QuizMode): number | null => {
    switch (mode) {
      case 'permit': return 30 * 60; // 30 minutes in seconds
      case 'license': return 60 * 60; // 60 minutes in seconds
      default: return null; // No time limit for quick and focused
    }
  };

  const handleStartQuiz = (mode: QuizMode, category?: string) => {
    setQuizMode(mode);
    const count = getQuestionCount(mode);
    const time = getTimeLimit(mode);
    setTimeLimit(time);
    
    // Filter by category if selected
    const filteredQuestions = category 
      ? questions.filter(q => q.test === category)
      : questions;
    
    // Shuffle and select questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, filteredQuestions.length));
    setSelectedQuestions(selected);
    setCurrentQuestionIndex(0);
    setScore(0);
    setScreen('quiz');
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < selectedQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setScreen('results');
    }
  };

  const handleRestart = () => {
    handleStartQuiz(quizMode);
  };

  const handleHome = () => {
    setScreen('home');
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  return (
    <>
      {screen === 'home' && <QuizHome onStartQuiz={handleStartQuiz} />}
      
      {screen === 'quiz' && selectedQuestions.length > 0 && (
        <QuizQuestion
          question={selectedQuestions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={selectedQuestions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onQuit={handleHome}
          timeLimit={timeLimit}
          onTimeUp={() => setScreen('results')}
        />
      )}
      
      {screen === 'results' && (
        <QuizResults
          score={score}
          totalQuestions={selectedQuestions.length}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </>
  );
};

export default Index;
