import { supabase } from "@/integrations/supabase/client";

export interface UserLectureSchedule {
  id: string;
  user_id: string;
  lecture_number: number;
  stage: "First Stage" | "Second Stage";
  scheduled_date: string | null;
  status: "not_started" | "scheduled" | "completed";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const getUserCurriculum = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_lecture_schedule")
    .select("*")
    .eq("user_id", userId)
    .order("lecture_number", { ascending: true });

  if (error) throw error;
  return data as UserLectureSchedule[];
};

export const initializeCurriculumForUser = async (userId: string) => {
  const { error } = await supabase.rpc("initialize_user_curriculum", {
    p_user_id: userId,
  });

  if (error) throw error;
};

export const updateLectureSchedule = async (
  userId: string,
  lectureNumber: number,
  updates: {
    scheduled_date?: string | null;
    status?: "not_started" | "scheduled" | "completed";
  }
) => {
  const { data, error } = await supabase
    .from("user_lecture_schedule")
    .update(updates)
    .eq("user_id", userId)
    .eq("lecture_number", lectureNumber)
    .select()
    .single();

  if (error) throw error;
  return data as UserLectureSchedule;
};

export const getCurriculumProgress = async (userId: string) => {
  const curriculum = await getUserCurriculum(userId);
  
  const total = curriculum.length;
  const completed = curriculum.filter(l => l.status === "completed").length;
  const scheduled = curriculum.filter(l => l.status === "scheduled").length;
  const notStarted = curriculum.filter(l => l.status === "not_started").length;

  return {
    total,
    completed,
    scheduled,
    notStarted,
    percentComplete: Math.round((completed / total) * 100),
  };
};

export const getUpcomingLectures = async (userId: string, limit = 5) => {
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("user_lecture_schedule")
    .select("*")
    .eq("user_id", userId)
    .not("scheduled_date", "is", null)
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as UserLectureSchedule[];
};
