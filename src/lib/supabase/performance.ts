import { supabase } from "@/integrations/supabase/client";

export interface CategoryPerformance {
  id?: string;
  user_id: string;
  category: string;
  correct: number;
  total: number;
  percentage?: number;
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
