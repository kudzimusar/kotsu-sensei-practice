import { supabase } from "@/integrations/supabase/client";

export interface PracticeQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export interface LessonMaterial {
  id: string;
  lecture_number: number;
  stage: string;
  textbook_references: string[];
  key_concepts: string[];
  practice_questions: PracticeQuestion[];
  created_at: string;
  updated_at: string;
}

export const getLessonMaterials = async (lectureNumber: number) => {
  const { data, error } = await supabase
    .from("curriculum_lesson_materials")
    .select("*")
    .eq("lecture_number", lectureNumber)
    .single();

  if (error) {
    console.error("Error fetching lesson materials:", error);
    return null;
  }
  
  // Parse the practice_questions JSON field
  return {
    ...data,
    practice_questions: data.practice_questions as unknown as PracticeQuestion[]
  } as LessonMaterial;
};

export const getAllLessonMaterials = async () => {
  const { data, error } = await supabase
    .from("curriculum_lesson_materials")
    .select("*")
    .order("lecture_number", { ascending: true });

  if (error) {
    console.error("Error fetching all lesson materials:", error);
    return [];
  }
  
  // Parse the practice_questions JSON field for each item
  return data.map(item => ({
    ...item,
    practice_questions: item.practice_questions as unknown as PracticeQuestion[]
  })) as LessonMaterial[];
};
