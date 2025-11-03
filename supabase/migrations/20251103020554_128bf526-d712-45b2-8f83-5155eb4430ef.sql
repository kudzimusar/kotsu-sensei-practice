-- Create translations table for multi-language support
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  en text NOT NULL,
  ja text,
  category text DEFAULT 'ui',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read translations
CREATE POLICY "Translations are publicly readable"
  ON public.translations
  FOR SELECT
  USING (true);

-- Only admins can manage translations
CREATE POLICY "Admins can manage translations"
  ON public.translations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_translations_key ON public.translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_category ON public.translations(category);

-- Insert initial translations
INSERT INTO public.translations (key, en, ja, category) VALUES
  -- Greetings
  ('greeting.morning', 'Good morning', 'おはよう', 'greeting'),
  ('greeting.afternoon', 'Good afternoon', 'こんにちは', 'greeting'),
  ('greeting.evening', 'Good evening', 'こんばんは', 'greeting'),
  
  -- Navigation
  ('nav.home', 'Home', 'ホーム', 'navigation'),
  ('nav.study', 'Study', '学習', 'navigation'),
  ('nav.tests', 'Tests', 'テスト', 'navigation'),
  ('nav.ai', 'AI', 'AI', 'navigation'),
  ('nav.planner', 'Planner', 'プランナー', 'navigation'),
  ('nav.profile', 'Profile', 'プロフィール', 'navigation'),
  ('nav.sign_up', 'Sign Up', '登録', 'navigation'),
  
  -- Actions
  ('actions.continue', 'Continue', '続ける', 'action'),
  ('actions.practice', 'Practice', '練習', 'action'),
  ('actions.view_all', 'View All', 'すべて表示', 'action'),
  ('actions.start', 'Start', '開始', 'action'),
  ('actions.next', 'Next', '次へ', 'action'),
  ('actions.back', 'Back', '戻る', 'action'),
  
  -- Home page
  ('home.test_ready', 'Test Ready', 'テスト準備完了', 'home'),
  ('home.day_streak', 'Day Streak', '日間連続', 'home'),
  ('home.exam_in', 'Your exam is in', '試験まであと', 'home'),
  ('home.days', 'days', '日', 'home'),
  ('home.practice_options', 'Practice Options', '練習オプション', 'home'),
  ('home.quick_practice', 'Quick Practice', 'クイック練習', 'home'),
  ('home.focused_study', 'Focused Study', '集中学習', 'home'),
  ('home.full_exam', 'Full Exam Simulation', '模擬試験', 'home'),
  ('home.study_tools', 'Study Tools', '学習ツール', 'home'),
  ('home.digital_textbooks', 'Digital Textbooks', 'デジタル教科書', 'home'),
  ('home.lectures', 'Lectures', '講義', 'home'),
  ('home.driving_schedule', 'Driving Schedule', '運転スケジュール', 'home'),
  ('home.learning_progress', 'Learning Progress', '学習進捗', 'home'),
  ('home.continue_learning', 'Continue Learning', '学習を続ける', 'home'),
  ('home.weak_areas', 'Practice Weak Areas', '弱点を練習', 'home'),
  ('home.upcoming_schedule', 'Upcoming Schedule', '今後のスケジュール', 'home'),
  ('home.no_exam_scheduled', 'No exam scheduled yet', 'まだ試験が予定されていません', 'home'),
  
  -- Quiz
  ('quiz.question', 'Question', '問題', 'quiz'),
  ('quiz.of', 'of', '/', 'quiz'),
  ('quiz.true', 'TRUE', '正', 'quiz'),
  ('quiz.false', 'FALSE', '誤', 'quiz'),
  ('quiz.correct', 'Correct!', '正解！', 'quiz'),
  ('quiz.incorrect', 'Incorrect', '不正解', 'quiz'),
  ('quiz.explanation', 'Explanation', '解説', 'quiz'),
  ('quiz.next_question', 'Next Question', '次の問題', 'quiz'),
  ('quiz.quit', 'Quit', '終了', 'quiz'),
  
  -- Settings
  ('settings.language', 'Language', '言語', 'settings'),
  ('settings.notifications', 'Notifications', '通知', 'settings'),
  ('settings.email_notifications', 'Email Notifications', 'メール通知', 'settings'),
  ('settings.push_notifications', 'Push Notifications', 'プッシュ通知', 'settings'),
  ('settings.study_reminders', 'Study Reminders', '学習リマインダー', 'settings'),
  ('settings.test_reminders', 'Test Reminders', 'テストリマインダー', 'settings'),
  
  -- Event types
  ('event.lecture', 'Lecture', '講義', 'event'),
  ('event.driving', 'Driving', '運転', 'event'),
  ('event.test', 'Test', 'テスト', 'event'),
  ('event.exam', 'Exam', '試験', 'event')
ON CONFLICT (key) DO NOTHING;