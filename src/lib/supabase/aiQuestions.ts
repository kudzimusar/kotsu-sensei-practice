import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/data/questions";

export const getAIQuestions = async (language: string = 'en'): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('ai_generated_questions')
    .select('*')
    .eq('status', 'approved')
    .eq('language', language);

  if (error) {
    console.error('Error fetching AI questions:', error);
    return [];
  }

  // Transform AI questions to match Question interface
  return data.map((q, index) => ({
    id: 10000 + index, // Start AI questions at ID 10000 to avoid conflicts
    test: q.test_category,
    question: q.question,
    answer: q.answer,
    explanation: q.explanation,
    figure: q.figure_url || undefined
  }));
};

export const getAllQuestionsWithAI = async (staticQuestions: Question[], language: string = 'en'): Promise<Question[]> => {
  const aiQuestions = await getAIQuestions(language);
  
  // Fetch questions from database (new image-based questions)
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true });
  
  // Convert database questions to Question format
  const formattedDbQuestions: Question[] = dbQuestions ? dbQuestions.map(q => ({
    id: q.id,
    test: q.test_category,
    question: q.question_text,
    answer: q.answer,
    explanation: q.explanation,
    figure: q.image_url || undefined
  })) : [];
  
  return [...staticQuestions, ...aiQuestions, ...formattedDbQuestions];
};
