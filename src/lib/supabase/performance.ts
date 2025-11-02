import { supabase } from "@/integrations/supabase/client";

export interface CategoryPerformance {
  id?: string;
  user_id: string;
  category: string;
  correct: number;
  total: number;
  percentage?: number;
  updated_at?: string;
  created_at?: string;
}

export const trackAnswer = async (userId: string, category: string, correct: boolean) => {
  // Get existing performance
  const { data: existing } = await supabase
    .from("category_performance")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("category_performance")
      .update({
        correct: existing.correct + (correct ? 1 : 0),
        total: existing.total + 1,
      })
      .eq("id", existing.id);

    if (error) throw error;
  } else {
    // Insert new
    const { error } = await supabase
      .from("category_performance")
      .insert({
        user_id: userId,
        category,
        correct: correct ? 1 : 0,
        total: 1,
      });

    if (error) throw error;
  }
};

export const getAllPerformance = async (userId: string): Promise<CategoryPerformance[]> => {
  const { data, error } = await supabase
    .from("category_performance")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  
  return (data || []).map(item => ({
    ...item,
    percentage: (item.correct / item.total) * 100,
  }));
};

export const getWeakCategories = async (userId: string): Promise<CategoryPerformance[]> => {
  const allPerformance = await getAllPerformance(userId);
  
  return allPerformance
    .filter(item => item.total >= 5 && (item.percentage || 0) < 70)
    .sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
};

export interface DetailedTestReadiness {
  overallReadiness: number;
  totalQuestions: number;
  categoriesMastered: number;
  totalCategories: number;
  weakCategories: number;
  averageAccuracy: number;
}

export const getDetailedTestReadiness = async (userId: string): Promise<DetailedTestReadiness> => {
  const allPerformance = await getAllPerformance(userId);
  
  if (allPerformance.length === 0) {
    return {
      overallReadiness: 0,
      totalQuestions: 0,
      categoriesMastered: 0,
      totalCategories: 0,
      weakCategories: 0,
      averageAccuracy: 0,
    };
  }

  const totalQuestions = allPerformance.reduce((sum, p) => sum + p.total, 0);
  const totalCategories = allPerformance.length;
  const categoriesMastered = allPerformance.filter(p => (p.percentage || 0) >= 80).length;
  const weakCategories = allPerformance.filter(p => (p.percentage || 0) < 70 && p.total >= 5).length;
  const averageAccuracy = Math.round(
    allPerformance.reduce((sum, p) => sum + (p.percentage || 0), 0) / totalCategories
  );

  // Calculate overall readiness based on multiple factors
  const readinessScore = Math.round(
    (averageAccuracy * 0.5) + // 50% weight on accuracy
    ((categoriesMastered / totalCategories) * 100 * 0.3) + // 30% weight on mastered categories
    (Math.min(totalQuestions / 500, 1) * 100 * 0.2) // 20% weight on total practice (500 questions target)
  );

  return {
    overallReadiness: Math.min(readinessScore, 100),
    totalQuestions,
    categoriesMastered,
    totalCategories,
    weakCategories,
    averageAccuracy,
  };
};
