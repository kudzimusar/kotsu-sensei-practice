import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  study_reminders: boolean;
  test_reminders: boolean;
  language: 'ja' | 'en';
  created_at: string;
  updated_at: string;
}

export const getSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  
  // If no settings exist, create default ones
  if (!data) {
    return await createSettings(userId);
  }
  
  return data;
};

export const createSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_settings")
    .insert({
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      study_reminders: true,
      test_reminders: true,
      language: 'ja',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSettings = async (userId: string, updates: Partial<UserSettings>) => {
  const { data, error } = await supabase
    .from("user_settings")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
