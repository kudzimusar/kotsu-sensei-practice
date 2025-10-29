import { supabase } from "@/integrations/supabase/client";
import type { EventType } from "@/components/StudyCalendar";

export interface StudyEvent {
  id: string;
  user_id: string;
  date: string;
  title: string;
  type: EventType;
  time?: string | null;
  description?: string | null;
  location?: string | null;
  instructor?: string | null;
}

export const getEvents = async (userId: string) => {
  const { data, error } = await supabase
    .from("study_events")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createEvent = async (event: Omit<StudyEvent, 'id'>) => {
  const { data, error } = await supabase
    .from("study_events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEvent = async (id: string, updates: Partial<StudyEvent>) => {
  const { data, error } = await supabase
    .from("study_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  const { error } = await supabase
    .from("study_events")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
