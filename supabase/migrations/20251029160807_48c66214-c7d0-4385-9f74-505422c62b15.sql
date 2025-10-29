-- Create ai_generated_questions table
CREATE TABLE public.ai_generated_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer boolean NOT NULL,
  explanation text NOT NULL,
  test_category text NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  figure_description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  rejection_reason text,
  generated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  source_concept text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'ja')),
  times_used integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  times_incorrect integer DEFAULT 0,
  user_feedback_score numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.ai_generated_questions ENABLE ROW LEVEL SECURITY;

-- Reviewers can see all
CREATE POLICY "Reviewers can view all questions" ON public.ai_generated_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Regular users can only see approved questions
CREATE POLICY "Users can view approved questions" ON public.ai_generated_questions
  FOR SELECT USING (status = 'approved');

-- Admins can manage questions
CREATE POLICY "Admins can manage questions" ON public.ai_generated_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create question_generation_logs table
CREATE TABLE public.question_generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid DEFAULT gen_random_uuid(),
  prompt_used text NOT NULL,
  model_used text NOT NULL,
  source_concept text,
  target_category text,
  target_language text,
  questions_requested integer,
  questions_generated integer,
  tokens_used integer,
  cost_estimate numeric,
  generation_duration_ms integer,
  triggered_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for logs
ALTER TABLE public.question_generation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view generation logs" ON public.question_generation_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create user_question_feedback table
CREATE TABLE public.user_question_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.ai_generated_questions(id) ON DELETE CASCADE,
  is_clear boolean,
  is_accurate boolean,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.user_question_feedback ENABLE ROW LEVEL SECURITY;

-- Users can manage own feedback
CREATE POLICY "Users can manage own feedback" ON public.user_question_feedback
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at on ai_generated_questions
CREATE TRIGGER update_ai_generated_questions_updated_at
  BEFORE UPDATE ON public.ai_generated_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();