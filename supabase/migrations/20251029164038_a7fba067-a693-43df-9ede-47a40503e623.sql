-- Add image URL field to AI generated questions
ALTER TABLE ai_generated_questions 
ADD COLUMN figure_url TEXT;

-- Add index for better query performance
CREATE INDEX idx_ai_questions_with_images ON ai_generated_questions(figure_url) WHERE figure_url IS NOT NULL;