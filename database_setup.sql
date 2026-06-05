-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  handle TEXT PRIMARY KEY,
  name TEXT,
  bio TEXT,
  location TEXT,
  coordinates DOUBLE PRECISION[], -- Array format: [longitude, latitude]
  categories TEXT[],              -- Supports multiple categories
  avatar TEXT,
  avatar_image TEXT,
  cover_image TEXT,
  cover_position NUMERIC DEFAULT 50,
  color TEXT,
  twitter TEXT,
  website TEXT,
  video_url TEXT,
  instagram TEXT,
  spotify TEXT,
  snipverse TEXT,
  facebook TEXT,
  kick TEXT,
  rumble TEXT,
  twitch TEXT,
  tiktok TEXT,
  youtube_live TEXT,
  instagram_live TEXT,
  is_member BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  membership_fee_xusdc NUMERIC DEFAULT 2.50,
  membership_fee_xpr NUMERIC DEFAULT 2500,
  membership_fee_xmd NUMERIC DEFAULT 2.50,
  membership_fee_metal NUMERIC DEFAULT 2.50,
  membership_fee_loan NUMERIC DEFAULT 10000,
  membership_fee_xmt NUMERIC DEFAULT 2.50,
  boost_price_xusdc NUMERIC DEFAULT 1.00,
  boost_price_xpr NUMERIC DEFAULT 1000,
  boost_price_tab NUMERIC DEFAULT 5000,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert global record if not exists
INSERT INTO public.platform_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- 3. SHOWCASE SITES TABLE
CREATE TABLE IF NOT EXISTS public.showcase_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  site_url TEXT NOT NULL,
  screenshot_url TEXT,
  description TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_handle TEXT NOT NULL,
  candidate_handle TEXT NOT NULL,
  tab_amount NUMERIC NOT NULL,
  week_identifier TEXT NOT NULL, -- e.g. Q2025-2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEDGER TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_handle TEXT NOT NULL,
  recipient_handle TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL,
  type TEXT NOT NULL, -- tip, activation, renewal, boost
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PROFILE VIEWS TABLE
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_handle TEXT NOT NULL,
  viewer_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- 8. DATA API GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_settings TO service_role;
GRANT SELECT ON TABLE public.platform_settings TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.showcase_sites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.showcase_sites TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.showcase_sites TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.votes TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ledger_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ledger_transactions TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.ledger_transactions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_views TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profile_views TO anon;

-- 9. SAFE RLS POLICIES (Drop existing policies first to prevent conflict errors)

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (length(handle) > 0);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (length(handle) > 0) WITH CHECK (length(handle) > 0);

-- Platform settings policies
DROP POLICY IF EXISTS "settings_select_policy" ON public.platform_settings;
DROP POLICY IF EXISTS "settings_update_policy" ON public.platform_settings;
CREATE POLICY "settings_select_policy" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "settings_update_policy" ON public.platform_settings FOR UPDATE USING (true);

-- Showcase sites policies
DROP POLICY IF EXISTS "showcase_select_policy" ON public.showcase_sites;
DROP POLICY IF EXISTS "showcase_insert_policy" ON public.showcase_sites;
DROP POLICY IF EXISTS "showcase_update_policy" ON public.showcase_sites;
CREATE POLICY "showcase_select_policy" ON public.showcase_sites FOR SELECT USING (true);
CREATE POLICY "showcase_insert_policy" ON public.showcase_sites FOR INSERT WITH CHECK (length(title) >= 1 AND length(site_url) >= 1);
CREATE POLICY "showcase_update_policy" ON public.showcase_sites FOR UPDATE USING (length(title) >= 1 AND length(site_url) >= 1);

-- Votes policies
DROP POLICY IF EXISTS "votes_select_policy" ON public.votes;
DROP POLICY IF EXISTS "votes_insert_policy" ON public.votes;
CREATE POLICY "votes_select_policy" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_policy" ON public.votes FOR INSERT WITH CHECK (true);

-- Ledger transactions policies
DROP POLICY IF EXISTS "ledger_select_policy" ON public.ledger_transactions;
DROP POLICY IF EXISTS "ledger_insert_policy" ON public.ledger_transactions;
CREATE POLICY "ledger_select_policy" ON public.ledger_transactions FOR SELECT USING (true);
CREATE POLICY "ledger_insert_policy" ON public.ledger_transactions FOR INSERT WITH CHECK (true);

-- Profile views policies
DROP POLICY IF EXISTS "views_select_policy" ON public.profile_views;
DROP POLICY IF EXISTS "views_insert_policy" ON public.profile_views;
CREATE POLICY "views_select_policy" ON public.profile_views FOR SELECT USING (true);
CREATE POLICY "views_insert_policy" ON public.profile_views FOR INSERT WITH CHECK (true);