import { supabase } from "@/integrations/supabase/client";

export interface Textbook {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  price: number | null;
  amazon_link: string | null;
  purchase_links: any;
  language: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TextbookChapter {
  id: string;
  textbook_id: string;
  chapter_number: number;
  title: string;
  description: string | null;
  content: string | null;
  page_start: number | null;
  page_end: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TextbookTerm {
  id: string;
  textbook_id: string;
  term: string;
  definition: string;
  category: string | null;
  example_usage: string | null;
  related_terms: string[] | null;
  chapter_reference: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getAllTextbooks = async () => {
  const { data, error } = await supabase
    .from("textbooks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching textbooks:", error);
    throw error;
  }

  return data as Textbook[];
};

export const getTextbookById = async (id: string) => {
  const { data, error } = await supabase
    .from("textbooks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching textbook:", error);
    throw error;
  }

  return data as Textbook;
};

export const getTextbookChapters = async (textbookId: string) => {
  const { data, error } = await supabase
    .from("textbook_chapters")
    .select("*")
    .eq("textbook_id", textbookId)
    .order("chapter_number", { ascending: true });

  if (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }

  return data as TextbookChapter[];
};

export const getTextbookTerminology = async (textbookId: string) => {
  const { data, error } = await supabase
    .from("textbook_terminology")
    .select("*")
    .eq("textbook_id", textbookId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching terminology:", error);
    throw error;
  }

  return data as TextbookTerm[];
};
