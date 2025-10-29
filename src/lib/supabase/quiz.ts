import { supabase } from "@/integrations/supabase/client";
import type { Question } from "@/data/questions";

export interface QuizProgress {
  id?: string;
  user_id: string;
  quiz_mode: 'quick' | 'focused' | 'permit' | 'license';
  current_question_index: number;
  score: number;
  time_limit: number | null;
  selected_questions: Question[];
}

export const saveQuizProgress = async (progress: Omit<QuizProgress, 'id'>) => {
  // Delete existing progress first
  await supabase
    .from("quiz_progress")
    .delete()
    .eq("user_id", progress.user_id);

  // Insert new progress
  const { data, error } = await supabase
    .from("quiz_progress")
    .insert({
      ...progress,
      selected_questions: progress.selected_questions as any,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const loadQuizProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("quiz_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? {
    ...data,
    selected_questions: data.selected_questions as unknown as Question[],
  } : null;
};

export const clearQuizProgress = async (userId: string) => {
  const { error } = await supabase
    .from("quiz_progress")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
};
