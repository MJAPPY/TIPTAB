-- Copy and run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to activate live tipping logs, persistent treasury tracking, and analytics!

-- 1. Create votes table (Handles quarterly voting ledger)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_handle TEXT NOT NULL,
  candidate_handle TEXT NOT NULL,
  tab_amount NUMERIC NOT NULL,
  week_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create transactions_log table (Handles unified ledger for tips, memberships, boosts, and showcase submissions)
CREATE TABLE IF NOT EXISTS public.transactions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'tip', 'membership', 'boost', 'showcase'
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Grant API Access to authenticated and anonymous connections
GRANT SELECT, INSERT ON TABLE public.votes TO authenticated;
GRANT SELECT, INSERT ON TABLE public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;

GRANT SELECT, INSERT ON TABLE public.transactions_log TO authenticated;
GRANT SELECT, INSERT ON TABLE public.transactions_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions_log TO service_role;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_log ENABLE ROW LEVEL SECURITY;

-- 5. Create Security Policies
CREATE POLICY "Allow public read access to votes" 
ON public.votes FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to votes" 
ON public.votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to transactions" 
ON public.transactions_log FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to transactions" 
ON public.transactions_log FOR INSERT WITH CHECK (true);