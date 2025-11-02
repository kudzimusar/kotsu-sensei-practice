-- Create textbooks table
CREATE TABLE IF NOT EXISTS public.textbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  publisher TEXT,
  isbn TEXT,
  cover_image_url TEXT,
  price NUMERIC(10, 2),
  amazon_link TEXT,
  purchase_links JSONB DEFAULT '[]'::jsonb,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create textbook chapters table
CREATE TABLE IF NOT EXISTS public.textbook_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  page_start INTEGER,
  page_end INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(textbook_id, chapter_number)
);

-- Create textbook terminology table
CREATE TABLE IF NOT EXISTS public.textbook_terminology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  category TEXT,
  example_usage TEXT,
  related_terms TEXT[],
  chapter_reference TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create user referrals table
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  commission_earned NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '90 days')
);

-- Create user earnings table
CREATE TABLE IF NOT EXISTS public.user_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('referral', 'affiliate_purchase', 'bonus', 'promotion')),
  description TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create affiliate products table
CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC(10, 2),
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
  affiliate_url TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create affiliate clicks table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  product_id UUID REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
  referral_code TEXT,
  ip_address TEXT,
  user_agent TEXT,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_terminology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for textbooks (publicly readable)
CREATE POLICY "Textbooks are publicly readable"
  ON public.textbooks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage textbooks"
  ON public.textbooks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- RLS Policies for textbook chapters (publicly readable)
CREATE POLICY "Textbook chapters are publicly readable"
  ON public.textbook_chapters FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage chapters"
  ON public.textbook_chapters FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- RLS Policies for textbook terminology (publicly readable)
CREATE POLICY "Textbook terminology is publicly readable"
  ON public.textbook_terminology FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage terminology"
  ON public.textbook_terminology FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- RLS Policies for user referrals
CREATE POLICY "Users can view own referrals"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
  ON public.user_referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can update own referrals"
  ON public.user_referrals FOR UPDATE
  USING (auth.uid() = referrer_user_id);

-- RLS Policies for user earnings
CREATE POLICY "Users can view own earnings"
  ON public.user_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage earnings"
  ON public.user_earnings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- RLS Policies for affiliate products
CREATE POLICY "Affiliate products are publicly readable"
  ON public.affiliate_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage affiliate products"
  ON public.affiliate_products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- RLS Policies for affiliate clicks
CREATE POLICY "Users can view own clicks"
  ON public.affiliate_clicks FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can track clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_textbook_chapters_textbook_id ON public.textbook_chapters(textbook_id);
CREATE INDEX idx_textbook_terminology_textbook_id ON public.textbook_terminology(textbook_id);
CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_user_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX idx_user_earnings_user_id ON public.user_earnings(user_id);
CREATE INDEX idx_affiliate_clicks_product_id ON public.affiliate_clicks(product_id);
CREATE INDEX idx_affiliate_clicks_user_id ON public.affiliate_clicks(user_id);

-- Create updated_at triggers
CREATE TRIGGER update_textbooks_updated_at
  BEFORE UPDATE ON public.textbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_textbook_chapters_updated_at
  BEFORE UPDATE ON public.textbook_chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_textbook_terminology_updated_at
  BEFORE UPDATE ON public.textbook_terminology
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_affiliate_products_updated_at
  BEFORE UPDATE ON public.affiliate_products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();