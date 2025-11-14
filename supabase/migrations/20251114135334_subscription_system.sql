-- ============================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- Creates tables for premium subscriptions, usage tracking, and instructor sessions
-- ============================================

-- Create subscription plan type enum
CREATE TYPE public.subscription_plan_type AS ENUM ('monthly', 'quarterly', 'annual', 'lifetime');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid');
CREATE TYPE public.instructor_session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type public.subscription_plan_type NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, status) -- One active subscription per user
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- ============================================
-- SUBSCRIPTION USAGE TABLE
-- Tracks daily usage limits for premium features
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('ai_questions', 'export_pdf', 'instructor_sessions')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  limit_count INTEGER NOT NULL DEFAULT 10, -- Free tier: 10, Premium: unlimited (set to 999999)
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '1 day'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, feature_type, usage_date)
);

-- Enable RLS
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_usage
CREATE POLICY "Users can view own usage"
  ON public.subscription_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.subscription_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.subscription_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- INSTRUCTORS TABLE
-- Stores information about available instructors
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['en', 'ja'],
  hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 2000.00, -- Default ¥2,000 per hour
  rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  availability_schedule JSONB, -- Store weekly availability as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instructors (publicly readable for active instructors)
CREATE POLICY "Active instructors are publicly readable"
  ON public.instructors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage instructors"
  ON public.instructors FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- ============================================
-- INSTRUCTOR SESSIONS TABLE
-- Tracks one-on-one sessions between users and instructors
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes IN (30, 60, 90)),
  status public.instructor_session_status NOT NULL DEFAULT 'scheduled',
  meeting_link TEXT, -- Zoom, Google Meet, etc.
  meeting_id TEXT,
  notes TEXT,
  user_notes TEXT, -- Notes from the user
  instructor_notes TEXT, -- Notes from the instructor
  price_paid NUMERIC(10, 2), -- Amount paid for this session
  stripe_payment_intent_id TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.instructor_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instructor_sessions
CREATE POLICY "Users can view own sessions"
  ON public.instructor_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.instructor_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.instructor_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Instructors can view their own sessions
CREATE POLICY "Instructors can view their sessions"
  ON public.instructor_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors
      WHERE instructors.id = instructor_sessions.instructor_id
      AND instructors.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ============================================
-- ADD is_premium TO PROFILES TABLE
-- Denormalized field for quick premium status checks
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create index for faster premium checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium) WHERE is_premium = true;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON public.subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_date ON public.subscription_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_instructor_sessions_user_id ON public.instructor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_sessions_instructor_id ON public.instructor_sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_sessions_scheduled_at ON public.instructor_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_instructor_sessions_status ON public.instructor_sessions(status);

-- ============================================
-- CREATE FUNCTION TO UPDATE is_premium IN PROFILES
-- Automatically updates profiles.is_premium when subscription status changes
-- ============================================
CREATE OR REPLACE FUNCTION public.update_profile_premium_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET is_premium = (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.user_id = NEW.user_id
      AND subscriptions.status IN ('active', 'trialing')
    )
  )
  WHERE profiles.id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update is_premium on subscription changes
DROP TRIGGER IF EXISTS trigger_update_profile_premium_status ON public.subscriptions;
CREATE TRIGGER trigger_update_profile_premium_status
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_premium_status();

-- ============================================
-- CREATE FUNCTION TO RESET DAILY USAGE
-- Automatically resets usage counts at midnight UTC
-- ============================================
CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
  -- Delete old usage records (older than 7 days)
  DELETE FROM public.subscription_usage
  WHERE usage_date < CURRENT_DATE - INTERVAL '7 days';
  
  -- Note: Actual reset of counts is handled by application logic
  -- This function can be called by a cron job if needed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE FUNCTION TO GET USER PREMIUM STATUS
-- Helper function to check if user has active premium subscription
-- ============================================
CREATE OR REPLACE FUNCTION public.is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- CREATE FUNCTION TO GET USER USAGE LIMIT
-- Returns the usage limit for a specific feature
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_feature_limit(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_limit INTEGER;
BEGIN
  -- Check if user is premium
  SELECT public.is_user_premium(p_user_id) INTO v_is_premium;
  
  -- Set limit based on premium status
  IF v_is_premium THEN
    v_limit := 999999; -- Unlimited for premium
  ELSE
    -- Free tier limits
    CASE p_feature_type
      WHEN 'ai_questions' THEN v_limit := 10;
      WHEN 'export_pdf' THEN v_limit := 0; -- Not available for free
      WHEN 'instructor_sessions' THEN v_limit := 0; -- Not available for free
      ELSE v_limit := 0;
    END CASE;
  END IF;
  
  RETURN v_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- CREATE FUNCTION TO CHECK AND INCREMENT USAGE
-- Atomically checks if user can use feature and increments count
-- ============================================
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_user_id UUID,
  p_feature_type TEXT,
  p_increment_by INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
  v_usage_date DATE;
  v_result JSONB;
BEGIN
  v_usage_date := CURRENT_DATE;
  
  -- Get user's limit
  SELECT public.get_user_feature_limit(p_user_id, p_feature_type) INTO v_limit;
  
  -- Get or create usage record
  INSERT INTO public.subscription_usage (user_id, feature_type, usage_date, count, limit_count)
  VALUES (p_user_id, p_feature_type, v_usage_date, 0, v_limit)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET updated_at = timezone('utc'::text, now())
  RETURNING count INTO v_current_count;
  
  -- Check if limit would be exceeded
  IF v_current_count + p_increment_by > v_limit THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'current_count', v_current_count,
      'limit', v_limit,
      'remaining', GREATEST(0, v_limit - v_current_count)
    );
  ELSE
    -- Increment count
    UPDATE public.subscription_usage
    SET count = count + p_increment_by,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id
      AND feature_type = p_feature_type
      AND usage_date = v_usage_date;
    
    v_result := jsonb_build_object(
      'allowed', true,
      'current_count', v_current_count + p_increment_by,
      'limit', v_limit,
      'remaining', v_limit - (v_current_count + p_increment_by)
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE UPDATED_AT TRIGGER FUNCTION (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscription_usage_updated_at
  BEFORE UPDATE ON public.subscription_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_instructor_sessions_updated_at
  BEFORE UPDATE ON public.instructor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- INITIALIZE USAGE TRACKING FOR EXISTING USERS
-- ============================================
-- This is optional - can be run separately if needed
-- INSERT INTO public.subscription_usage (user_id, feature_type, limit_count)
-- SELECT id, 'ai_questions', 10 FROM auth.users
-- ON CONFLICT DO NOTHING;

