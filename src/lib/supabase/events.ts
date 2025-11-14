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

export const getEvents = async (userId: string, options?: { startDate?: string; endDate?: string; limit?: number }) => {
  let query = supabase
    .from("study_events")
    .select("*")
    .eq("user_id", userId);

  // Add date range filters if provided
  if (options?.startDate) {
    query = query.gte("date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("date", options.endDate);
  }

  query = query.order("date", { ascending: true });

  // Add limit to prevent fetching all records
  if (options?.limit) {
    query = query.limit(options.limit);
  } else if (!options?.startDate && !options?.endDate) {
    // Default limit if no date range specified (prevent loading all historical events)
    query = query.limit(100);
  }

  const { data, error } = await query;

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
