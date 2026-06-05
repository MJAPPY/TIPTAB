-- Copy and run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to activate global treasury analytics, member views tracking, and live metric syncing!

-- 1. Create votes table (TAB quarterly champions)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_handle TEXT NOT NULL,
  candidate_handle TEXT NOT NULL,
  tab_amount NUMERIC NOT NULL,
  week_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create global ledger_transactions table (Treasury & Earnings tracker)
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_handle TEXT NOT NULL,
  recipient_handle TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL,
  type TEXT NOT NULL, -- 'tip', 'activation', 'renewal', 'boost'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create profile_views table (Views tracker)
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_handle TEXT NOT NULL,
  viewer_handle TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on all tables (REQUIRED for security)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- 5. Enable Data API Grants (REQUIRED)
GRANT SELECT, INSERT ON TABLE public.votes TO authenticated;
GRANT SELECT, INSERT ON TABLE public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;

GRANT SELECT, INSERT ON TABLE public.ledger_transactions TO authenticated;
GRANT SELECT, INSERT ON TABLE public.ledger_transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ledger_transactions TO service_role;

GRANT SELECT, INSERT ON TABLE public.profile_views TO authenticated;
GRANT SELECT, INSERT ON TABLE public.profile_views TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_views TO service_role;

-- 6. Create secure policies for SELECT/INSERT operations
CREATE POLICY "Allow public read access to votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Allow public inserts to votes" ON public.votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to ledger" ON public.ledger_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public inserts to ledger" ON public.ledger_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to views" ON public.profile_views FOR SELECT USING (true);
CREATE POLICY "Allow public inserts to views" ON public.profile_views FOR INSERT WITH CHECK (true);