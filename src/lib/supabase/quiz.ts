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
  try {
    // Delete existing progress first (ignore errors - might not exist)
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

    if (error) {
      // Log but don't throw - prevents infinite retry loops
      console.error('Error saving quiz progress:', error);
      return null;
    }
    return data;
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error saving quiz progress:', error);
    return null;
  }
};

export const loadQuizProgress = async (userId: string | null, guestSessionId?: string | null) => {
  try {
    // Build query to get the most recent progress
    let query = supabase
      .from("quiz_progress")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (userId) {
      query = query.eq("user_id", userId);
    } else if (guestSessionId) {
      query = query.eq("guest_session_id", guestSessionId);
    } else {
      return null;
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error loading quiz progress:', error);
      return null;
    }
    
    // Return the first (most recent) progress if it exists
    if (data && data.length > 0) {
      const progress = data[0];
      
      // Clean up any duplicate entries in the background (don't await)
      (async () => {
        try {
          let cleanupQuery = supabase
            .from("quiz_progress")
            .select("id")
            .order("created_at", { ascending: false });
          
          if (userId) {
            cleanupQuery = cleanupQuery.eq("user_id", userId);
          } else if (guestSessionId) {
            cleanupQuery = cleanupQuery.eq("guest_session_id", guestSessionId);
          }
          
          const { data: allRows } = await cleanupQuery;
          
          if (allRows && allRows.length > 1 && progress.id) {
            // Delete all except the most recent (which we already have)
            const idsToDelete = allRows
              .filter(r => r.id !== progress.id)
              .map(r => r.id);
            
            if (idsToDelete.length > 0) {
              await supabase
                .from("quiz_progress")
                .delete()
                .in("id", idsToDelete);
            }
          }
        } catch (cleanupError) {
          // Ignore cleanup errors - not critical
          console.error('Error cleaning up duplicate quiz progress:', cleanupError);
        }
      })();
      
      return {
        ...progress,
        selected_questions: progress.selected_questions as unknown as Question[],
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading quiz progress:', error);
    return null;
  }
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
