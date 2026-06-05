-- Copy and run this script in your Supabase SQL Editor to activate the global 
-- financial ledger, treasury records, and analytical logs.

-- 1. Create votes table (for legacy leaderboard compatibility)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_handle TEXT NOT NULL,
  candidate_handle TEXT NOT NULL,
  tab_amount NUMERIC NOT NULL,
  week_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the unified network activity ledger table
CREATE TABLE IF NOT EXISTS public.network_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- 'tip', 'boost', 'membership_activation', 'membership_renewal'
  sender_handle TEXT NOT NULL,
  recipient_handle TEXT,       -- null for activations/system events
  amount NUMERIC NOT NULL,
  asset_symbol TEXT NOT NULL,  -- 'TAB', 'XPR', 'XUSDC', 'XMD', 'METAL', 'LOAN', 'XMT'
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Grant API Access to authenticated and anonymous connections
GRANT SELECT, INSERT ON TABLE public.votes TO authenticated;
GRANT SELECT, INSERT ON TABLE public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;

GRANT SELECT, INSERT ON TABLE public.network_activity TO authenticated;
GRANT SELECT, INSERT ON TABLE public.network_activity TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.network_activity TO service_role;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_activity ENABLE ROW LEVEL SECURITY;

-- 5. Create Security Policies
CREATE POLICY "Allow public read access to votes" 
ON public.votes FOR SELECT 
USING (true);

CREATE POLICY "Allow public inserts to votes" 
ON public.votes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to network_activity" 
ON public.network_activity FOR SELECT 
USING (true);

CREATE POLICY "Allow public inserts to network_activity" 
ON public.network_activity FOR INSERT 
WITH CHECK (true);