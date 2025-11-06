// Extended Question type that supports database schema
export interface DatabaseQuestion {
  id: number;
  test_category: string;
  question_text: string;
  answer: boolean;
  explanation: string;
  
  // Image handling
  image_type?: 'sign' | 'scenario' | 'none';
  image_path?: string;
  image_storage_path?: string;
  image_url?: string;
  
  // Metadata
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  times_shown?: number;
  times_correct?: number;
  
  created_at?: string;
  updated_at?: string;
}

// Mapping function to convert between legacy and database format
export function toDatabaseQuestion(legacy: {
  id: number;
  test: string;
  question: string;
  answer: boolean;
  explanation: string;
  figure?: string;
}): DatabaseQuestion {
  return {
    id: legacy.id,
    test_category: legacy.test,
    question_text: legacy.question,
    answer: legacy.answer,
    explanation: legacy.explanation,
    image_type: legacy.figure ? 'sign' : 'none',
    image_path: legacy.figure,
    image_url: legacy.figure,
    tags: [],
    difficulty: 'medium',
  };
}

export function fromDatabaseQuestion(db: DatabaseQuestion): {
  id: number;
  test: string;
  question: string;
  answer: boolean;
  explanation: string;
  figure?: string;
} {
  return {
    id: db.id,
    test: db.test_category,
    question: db.question_text,
    answer: db.answer,
    explanation: db.explanation,
    figure: db.image_url || db.image_path,
  };
}
