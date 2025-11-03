import { supabase } from "@/integrations/supabase/client";

export interface DrivingScheduleEvent {
  id: string;
  user_id: string;
  date: string;
  time_slot: string;
  event_type: 'theory' | 'driving' | 'test' | 'orientation' | 'aptitude';
  lecture_number?: number;
  custom_label?: string;
  symbol?: string;
  location?: string;
  instructor?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  country_code: string;
}

export const getMonthSchedule = async (userId: string, year: number, month: number) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from("driving_school_schedule")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getHolidays = async (year: number, month: number) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createScheduleEvent = async (event: Omit<DrivingScheduleEvent, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from("driving_school_schedule")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateScheduleEvent = async (id: string, updates: Partial<DrivingScheduleEvent>) => {
  const { data, error } = await supabase
    .from("driving_school_schedule")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteScheduleEvent = async (id: string) => {
  const { error } = await supabase
    .from("driving_school_schedule")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const bulkImportSchedule = async (userId: string, events: Omit<DrivingScheduleEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
  const eventsWithUser = events.map(event => ({
    ...event,
    user_id: userId,
  }));

  const { data, error } = await supabase
    .from("driving_school_schedule")
    .insert(eventsWithUser)
    .select();

  if (error) throw error;
  return data;
};

export const getUpcomingEvent = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("driving_school_schedule")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time_slot", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const markEventComplete = async (id: string) => {
  return updateScheduleEvent(id, { status: 'completed' });
};

export const getUpcomingTestEvent = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("driving_school_schedule")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .eq("event_type", "test")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUpcomingScheduleEvents = async (userId: string, limit: number = 5) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("driving_school_schedule")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time_slot", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const autoCompletePastEvents = async () => {
  const { error } = await supabase.rpc("auto_complete_past_schedule_events");
  
  if (error) {
    console.error("Error auto-completing past events:", error);
    throw error;
  }
};

export const manuallyMarkComplete = async (eventId: string) => {
  const { data, error } = await supabase.rpc("mark_schedule_event_complete", {
    event_id: eventId,
  });

  if (error) throw error;
  return data as DrivingScheduleEvent;
};
