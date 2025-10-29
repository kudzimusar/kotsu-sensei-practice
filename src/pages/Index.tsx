import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QuizHome from "@/components/QuizHome";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";
import { questions } from "@/data/questions";
import type { Question } from "@/data/questions";
import { useAuth } from "@/hooks/useAuth";
import { saveQuizProgress, loadQuizProgress, clearQuizProgress } from "@/lib/supabase/quiz";
import { trackAnswer } from "@/lib/supabase/performance";
import { getWeakCategories } from "@/lib/supabase/performance";
import { saveTestHistory } from "@/lib/supabase/tests";

type QuizMode = 'quick' | 'focused' | 'permit' | 'license';
type Screen = 'home' | 'quiz' | 'results';

const Index = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [screen, setScreen] = useState<Screen>('home');
  const [quizMode, setQuizMode] = useState<QuizMode>('quick');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Check for category query parameter and auto-start quiz
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && user && screen === 'home') {
      handleStartQuiz('focused', category);
      // Clear the query parameter after starting
      setSearchParams({});
    }
  }, [searchParams, user]);

  const handleContinueLearning = async () => {
    if (!user) return;
    const progress = await loadQuizProgress(user.id);
    if (progress) {
      setQuizMode(progress.quiz_mode as QuizMode);
      setSelectedQuestions(progress.selected_questions);
      setCurrentQuestionIndex(progress.current_question_index);
      setScore(progress.score);
      setTimeLimit(progress.time_limit);
      setScreen('quiz');
    }
  };

  // Save progress whenever quiz state changes
  useEffect(() => {
    if (screen === 'quiz' && selectedQuestions.length > 0 && user) {
      saveQuizProgress({
        user_id: user.id,
        quiz_mode: quizMode,
        selected_questions: selectedQuestions,
        current_question_index: currentQuestionIndex,
        score,
        time_limit: timeLimit,
      });
    }
  }, [screen, quizMode, selectedQuestions, currentQuestionIndex, score, timeLimit, user]);

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

  const handleStartQuiz = async (mode: QuizMode, category?: string, weakAreas?: boolean) => {
    if (!user) return;
    
    setQuizMode(mode);
    const count = getQuestionCount(mode);
    const time = getTimeLimit(mode);
    setTimeLimit(time);
    setStartTime(Date.now());
    
    let filteredQuestions = questions;
    
    // Filter by weak areas if requested
    if (weakAreas) {
      const weakCategories = await getWeakCategories(user.id);
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

  const handleAnswer = async (correct: boolean) => {
    if (!user) return;
    
    if (correct) {
      setScore(score + 1);
    }
    
    // Track answer for performance analytics
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (currentQuestion) {
      await trackAnswer(user.id, currentQuestion.test, correct);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex + 1 < selectedQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Save test history before showing results
      if (user) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        await saveTestHistory({
          user_id: user.id,
          test_type: quizMode,
          date: new Date().toISOString(),
          passed: score >= Math.ceil(selectedQuestions.length * 0.7), // 70% pass rate
          score,
          time_taken: timeTaken,
          total_questions: selectedQuestions.length,
        });
      }
      setScreen('results');
    }
  };

  const handleRestart = () => {
    handleStartQuiz(quizMode);
  };

  const handleHome = async () => {
    if (user) {
      await clearQuizProgress(user.id);
    }
    setScreen('home');
    setCurrentQuestionIndex(0);
    setScore(0);
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
