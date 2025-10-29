import { supabase } from "@/integrations/supabase/client";

export interface StudyGoals {
  id: string;
  user_id: string;
  daily_questions_target: number;
  weekly_study_hours_target: number;
  exam_prep_days: number;
  created_at: string;
  updated_at: string;
}

export const getGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from("study_goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  
  // If no goals exist, create default ones
  if (!data) {
    return await createGoals(userId);
  }
  
  return data;
};

export const createGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from("study_goals")
    .insert({
      user_id: userId,
      daily_questions_target: 10,
      weekly_study_hours_target: 5,
      exam_prep_days: 30,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGoals = async (userId: string, updates: Partial<StudyGoals>) => {
  const { data, error } = await supabase
    .from("study_goals")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
