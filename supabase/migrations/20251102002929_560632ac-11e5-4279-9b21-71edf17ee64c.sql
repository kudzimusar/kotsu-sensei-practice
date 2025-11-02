-- Create holidays table for Japanese national holidays
CREATE TABLE public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  name text NOT NULL,
  country_code text DEFAULT 'JP',
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Create driving school schedule table
CREATE TABLE public.driving_school_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  time_slot text NOT NULL,
  event_type text NOT NULL,
  lecture_number integer,
  custom_label text,
  symbol text,
  location text,
  instructor text,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driving_school_schedule ENABLE ROW LEVEL SECURITY;

-- Holidays policies
CREATE POLICY "Holidays are publicly readable"
  ON public.holidays FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage holidays"
  ON public.holidays FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Driving schedule policies
CREATE POLICY "Users can view own schedule"
  ON public.driving_school_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule"
  ON public.driving_school_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule"
  ON public.driving_school_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedule"
  ON public.driving_school_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_schedule_user_date ON public.driving_school_schedule(user_id, date);
CREATE INDEX idx_schedule_date ON public.driving_school_schedule(date);
CREATE INDEX idx_holidays_date ON public.holidays(date);

-- Trigger for updated_at
CREATE TRIGGER update_driving_schedule_updated_at
  BEFORE UPDATE ON public.driving_school_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert Japanese holidays for November 2025
INSERT INTO public.holidays (date, name, country_code) VALUES
  ('2025-11-03', 'Culture Day (文化の日)', 'JP'),
  ('2025-11-23', 'Labor Thanksgiving Day (勤労感謝の日)', 'JP'),
  ('2025-11-24', 'Labor Thanksgiving Day (Observed)', 'JP')
ON CONFLICT (date) DO NOTHING;