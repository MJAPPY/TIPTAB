-- SQL commands for initializing the platform sync database
-- Please execute these within your Supabase SQL Editor.

-- 1. Create Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_handle TEXT NOT NULL,
  candidate_handle TEXT NOT NULL,
  tab_amount NUMERIC NOT NULL,
  week_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Ledger Transactions Table (Treasury Hub)
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_handle TEXT NOT NULL,
  recipient_handle TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL,
  type TEXT NOT NULL, -- 'tip', 'activation', 'renewal', 'boost'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Profile Views Table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_handle TEXT NOT NULL,
  viewer_handle TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Grant API Permissions to Authenticated and Anonymous Users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ledger_transactions TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_views TO authenticated, anon, service_role;

-- Setup Access Policies for Votes
CREATE POLICY "votes_select_policy" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_policy" ON public.votes FOR INSERT WITH CHECK (true);

-- Setup Access Policies for Ledger Transactions
CREATE POLICY "ledger_select_policy" ON public.ledger_transactions FOR SELECT USING (true);
CREATE POLICY "ledger_insert_policy" ON public.ledger_transactions FOR INSERT WITH CHECK (true);

-- Setup Access Policies for Profile Views
CREATE POLICY "views_select_policy" ON public.profile_views FOR SELECT USING (true);
CREATE POLICY "views_insert_policy" ON public.profile_views FOR INSERT WITH CHECK (true);