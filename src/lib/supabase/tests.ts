import { supabase } from "@/integrations/supabase/client";

export interface TestHistory {
  id?: string;
  user_id: string | null;
  guest_session_id?: string | null;
  test_type: string;
  date: string;
  passed: boolean;
  score: number;
  time_taken: number;
  total_questions: number;
}

export const saveTestHistory = async (test: Omit<TestHistory, 'id'>) => {
  const { data, error } = await supabase
    .from("test_history")
    .insert(test)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTestHistory = async (userId: string | null, guestSessionId?: string | null) => {
  let query = supabase.from("test_history").select("*").order("date", { ascending: false });
  
  if (userId) {
    query = query.eq("user_id", userId);
  } else if (guestSessionId) {
    query = query.eq("guest_session_id", guestSessionId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getTestStats = async (userId: string | null, guestSessionId?: string | null) => {
  const history = await getTestHistory(userId, guestSessionId);
  
  if (history.length === 0) {
    return {
      totalTests: 0,
      passRate: 0,
      avgScore: 0,
      bestStreak: 0,
    };
  }

  const totalTests = history.length;
  const passed = history.filter(t => t.passed).length;
  const passRate = Math.round((passed / totalTests) * 100);
  const avgScore = Math.round(
    history.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) / totalTests
  );

  // Calculate best streak
  let currentStreak = 0;
  let bestStreak = 0;
  for (const test of history.reverse()) {
    if (test.passed) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return { totalTests, passRate, avgScore, bestStreak };
};
