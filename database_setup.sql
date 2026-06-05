-- Copy and run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to activate global analytics, voting, and live ticker syncing!

-- 1. Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_handle TEXT NOT NULL,
  candidate_handle TEXT NOT NULL,
  tab_amount NUMERIC NOT NULL,
  week_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Grant API Access to authenticated and anonymous connections
GRANT SELECT, INSERT ON TABLE public.votes TO authenticated;
GRANT SELECT, INSERT ON TABLE public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
CREATE POLICY "Allow public read access to votes" 
ON public.votes FOR SELECT 
USING (true);

CREATE POLICY "Allow public inserts to votes" 
ON public.votes FOR INSERT 
WITH CHECK (true);