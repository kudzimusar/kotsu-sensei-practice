import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/types/database';

export function useQuestions(testCategory?: string) {
  return useQuery({
    queryKey: ['questions', testCategory],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true });
      
      if (testCategory) {
        query = query.eq('test_category', testCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DatabaseQuestion[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
  });
}

export function useQuestionsByTags(tags: string[]) {
  return useQuery({
    queryKey: ['questions', 'tags', tags],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .contains('tags', tags)
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data as DatabaseQuestion[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
  return useQuery({
    queryKey: ['questions', 'difficulty', difficulty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('difficulty', difficulty)
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data as DatabaseQuestion[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useUpdateQuestionStats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, correct }: { id: number; correct: boolean }) => {
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('times_shown, times_correct')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          times_shown: (question.times_shown || 0) + 1,
          times_correct: (question.times_correct || 0) + (correct ? 1 : 0),
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
