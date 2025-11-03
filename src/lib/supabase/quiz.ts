import { supabase } from "@/integrations/supabase/client";
import type { Question } from "@/data/questions";

export interface QuizProgress {
  id?: string;
  user_id: string | null;
  guest_session_id?: string | null;
  quiz_mode: 'quick' | 'focused' | 'permit' | 'license';
  current_question_index: number;
  score: number;
  time_limit: number;
  selected_questions: Question[];
}

export const saveQuizProgress = async (progress: Omit<QuizProgress, 'id'>) => {
  // Delete existing progress first
  if (progress.user_id) {
    await supabase
      .from("quiz_progress")
      .delete()
      .eq("user_id", progress.user_id);
  } else if (progress.guest_session_id) {
    await supabase
      .from("quiz_progress")
      .delete()
      .eq("guest_session_id", progress.guest_session_id);
  }

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

export const loadQuizProgress = async (userId: string | null, guestSessionId?: string | null) => {
  let query = supabase.from("quiz_progress").select("*");
  
  if (userId) {
    query = query.eq("user_id", userId);
  } else if (guestSessionId) {
    query = query.eq("guest_session_id", guestSessionId);
  } else {
    return null;
  }
  
  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data ? {
    ...data,
    selected_questions: data.selected_questions as unknown as Question[],
  } : null;
};

export const clearQuizProgress = async (userId: string | null, guestSessionId?: string | null) => {
  let query = supabase.from("quiz_progress").delete();
  
  if (userId) {
    query = query.eq("user_id", userId);
  } else if (guestSessionId) {
    query = query.eq("guest_session_id", guestSessionId);
  } else {
    return;
  }
  
  const { error } = await query;
  if (error) throw error;
};
