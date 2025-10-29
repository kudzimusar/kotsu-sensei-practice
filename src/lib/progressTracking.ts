import type { Question } from "@/data/questions";

export interface QuizProgress {
  quizMode: 'quick' | 'focused' | 'permit' | 'license';
  selectedQuestions: Question[];
  currentQuestionIndex: number;
  score: number;
  timeLimit: number | null;
  timestamp: number;
}

export interface CategoryPerformance {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

const PROGRESS_KEY = 'quiz_progress';
const PERFORMANCE_KEY = 'category_performance';

// Save current quiz progress
export const saveProgress = (progress: QuizProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

// Load saved quiz progress
export const loadProgress = (): QuizProgress | null => {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

// Clear saved progress
export const clearProgress = () => {
  localStorage.removeItem(PROGRESS_KEY);
};

// Track answer for a category
export const trackAnswer = (category: string, correct: boolean) => {
  const performance = getPerformanceData();
  
  if (!performance[category]) {
    performance[category] = { correct: 0, total: 0 };
  }
  
  performance[category].total++;
  if (correct) {
    performance[category].correct++;
  }
  
  localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performance));
};

// Get performance data
const getPerformanceData = (): Record<string, { correct: number; total: number }> => {
  const saved = localStorage.getItem(PERFORMANCE_KEY);
  if (!saved) return {};
  
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
};

// Get weak categories (< 70% success rate)
export const getWeakCategories = (): CategoryPerformance[] => {
  const performance = getPerformanceData();
  
  return Object.entries(performance)
    .map(([category, data]) => ({
      category,
      correct: data.correct,
      total: data.total,
      percentage: (data.correct / data.total) * 100
    }))
    .filter(item => item.total >= 5 && item.percentage < 70) // At least 5 questions attempted
    .sort((a, b) => a.percentage - b.percentage); // Sort by worst performance first
};

// Get all category performance
export const getAllPerformance = (): CategoryPerformance[] => {
  const performance = getPerformanceData();
  
  return Object.entries(performance)
    .map(([category, data]) => ({
      category,
      correct: data.correct,
      total: data.total,
      percentage: (data.correct / data.total) * 100
    }))
    .filter(item => item.total > 0)
    .sort((a, b) => a.percentage - b.percentage);
};
