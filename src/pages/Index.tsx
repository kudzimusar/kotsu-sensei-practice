import { useState, useEffect } from "react";
import QuizHome from "@/components/QuizHome";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";
import { questions } from "@/data/questions";
import type { Question } from "@/data/questions";
import { saveProgress, clearProgress, trackAnswer, getWeakCategories, loadProgress } from "@/lib/progressTracking";

type QuizMode = 'quick' | 'focused' | 'permit' | 'license';
type Screen = 'home' | 'quiz' | 'results';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [quizMode, setQuizMode] = useState<QuizMode>('quick');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Remove the resume effect since we'll handle it directly
  const handleContinueLearning = () => {
    const progress = loadProgress();
    if (progress) {
      setQuizMode(progress.quizMode);
      setSelectedQuestions(progress.selectedQuestions);
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setScore(progress.score);
      setTimeLimit(progress.timeLimit);
      setScreen('quiz');
    }
  };

  // Save progress whenever quiz state changes
  useEffect(() => {
    if (screen === 'quiz' && selectedQuestions.length > 0) {
      saveProgress({
        quizMode,
        selectedQuestions,
        currentQuestionIndex,
        score,
        timeLimit,
        timestamp: Date.now()
      });
    }
  }, [screen, quizMode, selectedQuestions, currentQuestionIndex, score, timeLimit]);

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

  const handleStartQuiz = (mode: QuizMode, category?: string, weakAreas?: boolean) => {
    setQuizMode(mode);
    const count = getQuestionCount(mode);
    const time = getTimeLimit(mode);
    setTimeLimit(time);
    
    let filteredQuestions = questions;
    
    // Filter by weak areas if requested
    if (weakAreas) {
      const weakCategories = getWeakCategories();
      if (weakCategories.length > 0) {
        const weakCategoryNames = weakCategories.map(wc => wc.category);
        filteredQuestions = questions.filter(q => weakCategoryNames.includes(q.test));
      }
    }
    // Filter by category if selected
    else if (category) {
      filteredQuestions = questions.filter(q => q.test === category);
    }
    
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
    
    // Track answer for performance analytics
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (currentQuestion) {
      trackAnswer(currentQuestion.test, correct);
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
    clearProgress(); // Clear saved progress when going home
  };

  return (
    <>
      {screen === 'home' && (
        <QuizHome 
          onStartQuiz={handleStartQuiz} 
          onContinueLearning={handleContinueLearning}
        />
      )}
      
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
