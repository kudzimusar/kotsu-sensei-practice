import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QuizHome from "@/components/QuizHome";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";
import { DrivingScheduleGrid } from "@/components/DrivingScheduleGrid";
import { questions } from "@/data/questions";
import type { Question } from "@/data/questions";
import { useAuth } from "@/hooks/useAuth";
import { useImagePreload } from "@/hooks/useImagePreload";
import { saveQuizProgress, loadQuizProgress, clearQuizProgress } from "@/lib/supabase/quiz";
import { trackAnswer } from "@/lib/supabase/performance";
import { getWeakCategories } from "@/lib/supabase/performance";
import { saveTestHistory } from "@/lib/supabase/tests";
import { getAllQuestionsWithAI } from "@/lib/supabase/aiQuestions";
import { toast } from "@/hooks/use-toast";
type QuizMode = 'quick' | 'focused' | 'permit' | 'license';
type Screen = 'home' | 'quiz' | 'results';

const Index = () => {
  const { user, guestId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [screen, setScreen] = useState<Screen>('home');
  const [quizMode, setQuizMode] = useState<QuizMode>('quick');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([]);

  // Preload next 3 question images for better performance
  useImagePreload(selectedQuestions, currentQuestionIndex, 3);

  // Check for category or test query parameter and auto-start quiz
  useEffect(() => {
    const category = searchParams.get('category');
    const test = searchParams.get('test');
    
    if (category && (user || guestId) && screen === 'home') {
      handleStartQuiz('focused', category);
      setSearchParams({});
    } else if (test && (user || guestId) && screen === 'home') {
      const testMode = test as QuizMode;
      if (testMode === 'permit' || testMode === 'license') {
        handleStartQuiz(testMode);
        setSearchParams({});
      }
    }
  }, [searchParams, user, guestId, screen]);

  const handleContinueLearning = async () => {
    if (!user && !guestId) return;
    const progress = await loadQuizProgress(user?.id || null, guestId);
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
    if (screen === 'quiz' && selectedQuestions.length > 0 && (user || guestId)) {
      saveQuizProgress({
        user_id: user?.id || null,
        guest_session_id: guestId || null,
        quiz_mode: quizMode,
        selected_questions: selectedQuestions,
        current_question_index: currentQuestionIndex,
        score,
        time_limit: timeLimit,
      });
    }
  }, [screen, quizMode, selectedQuestions, currentQuestionIndex, score, timeLimit, user, guestId]);

  const getQuestionCount = (mode: QuizMode): number => {
    switch (mode) {
      case 'quick': return 10;
      case 'focused': return 20;
      case 'permit': return 50;
      case 'license': return 100;
    }
  };

  const getTimeLimit = (mode: QuizMode): number => {
    switch (mode) {
      case 'quick': return 6 * 60; // 6 minutes for 10 questions
      case 'focused': return 12 * 60; // 12 minutes for 20 questions
      case 'permit': return 30 * 60; // 30 minutes for 50 questions (official standard)
      case 'license': return 50 * 60; // 50 minutes for 100 questions (official standard)
    }
  };

  const handleStartQuiz = async (mode: QuizMode, category?: string, weakAreas?: boolean) => {
    if (!user && !guestId) return;
    
    setIsStartingQuiz(true);
    
    try {
      setQuizMode(mode);
      const count = getQuestionCount(mode);
      const time = getTimeLimit(mode);
      setTimeLimit(time);
      setStartTime(Date.now());
      
      // Get all questions including AI-generated ones
      const allQuestions = await getAllQuestionsWithAI(questions, 'en');
      let filteredQuestions = allQuestions;
      
      // Filter by weak areas if requested (only for authenticated users)
      if (weakAreas && user) {
        const weakCategories = await getWeakCategories(user.id);
        if (weakCategories.length > 0) {
          const weakCategoryNames = weakCategories.map(wc => wc.category);
          filteredQuestions = allQuestions.filter(q => weakCategoryNames.includes(q.test));
        }
      }
      // Filter by category if selected
      else if (category) {
        filteredQuestions = allQuestions.filter(q => q.test === category);
      }
      
      // Shuffle and select questions
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, filteredQuestions.length));
      setSelectedQuestions(selected);
      setCurrentQuestionIndex(0);
      setScore(0);
      setScreen('quiz');
    } finally {
      setIsStartingQuiz(false);
    }
  };

  const handleAnswer = async (correct: boolean) => {
    const newScore = correct ? score + 1 : score;
    
    if (correct) {
      setScore(newScore);
    } else {
      // Track failed questions for retry option
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      if (currentQuestion && !failedQuestions.find(q => q.id === currentQuestion.id)) {
        setFailedQuestions(prev => [...prev, currentQuestion]);
      }
    }
    
    // Track answer for performance analytics (only for authenticated users)
    if (user) {
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      if (currentQuestion) {
        await trackAnswer(user.id, currentQuestion.test, correct);
      }
    }

    // If this was the last question, complete the quiz immediately
    if (currentQuestionIndex + 1 >= selectedQuestions.length) {
      setTimeout(async () => {
        await handleQuizComplete();
      }, 1500); // Short delay to show final answer feedback
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex + 1 < selectedQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    // Save test history before showing results
    if (user || guestId) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const percentage = (score / selectedQuestions.length) * 100;
      const passed = percentage >= 90;
      
      await saveTestHistory({
        user_id: user?.id || null,
        guest_session_id: guestId || null,
        test_type: quizMode,
        date: new Date().toISOString(),
        passed,
        score,
        time_taken: timeTaken,
        total_questions: selectedQuestions.length,
      });

      // Show completion notification
      toast({
        title: passed ? "🎉 Test Completed - You Passed!" : "📚 Test Completed",
        description: passed 
          ? `Amazing! You scored ${percentage.toFixed(0)}% (${score}/${selectedQuestions.length})` 
          : `You scored ${percentage.toFixed(0)}% (${score}/${selectedQuestions.length}). Review and try again!`,
        duration: 5000,
      });
    }
    setScreen('results');
  };

  const handleRestart = () => {
    setFailedQuestions([]);
    handleStartQuiz(quizMode);
  };

  const handleRetryFailed = () => {
    if (failedQuestions.length === 0) return;
    
    setQuizMode('focused');
    const time = Math.ceil(failedQuestions.length * 0.6 * 60); // 36 seconds per question
    setTimeLimit(time);
    setStartTime(Date.now());
    setSelectedQuestions(failedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFailedQuestions([]);
    setScreen('quiz');
    
    toast({
      title: "🎯 Practice Mode: Failed Questions",
      description: `Focusing on ${failedQuestions.length} question${failedQuestions.length > 1 ? 's' : ''} you missed. Good luck!`,
    });
  };

  const handleHome = async () => {
    if (user || guestId) {
      await clearQuizProgress(user?.id || null, guestId);
    }
    setScreen('home');
    setCurrentQuestionIndex(0);
    setScore(0);
    setFailedQuestions([]);
  };

  return (
    <>
      {screen === 'home' && (
        <QuizHome 
          onStartQuiz={handleStartQuiz} 
          onContinueLearning={handleContinueLearning}
          isStartingQuiz={isStartingQuiz}
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
          onTimeUp={handleQuizComplete}
        />
      )}
      
      {screen === 'results' && (
        <QuizResults
          score={score}
          totalQuestions={selectedQuestions.length}
          onRestart={handleRestart}
          onHome={handleHome}
          failedQuestions={failedQuestions}
          onRetryFailed={handleRetryFailed}
        />
      )}
    </>
  );
};

export default Index;
