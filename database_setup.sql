-- Copy and run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to activate global analytics, voting, treasury boards, and live profile syncing!

-- 1. Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  handle TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  bio TEXT,
  location TEXT,
  coordinates NUMERIC[],
  categories TEXT[],
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

-- 2. Create platform_transactions table
CREATE TABLE IF NOT EXISTS public.platform_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_handle TEXT NOT NULL,
  recipient_handle TEXT NOT NULL, -- Use 'tiptab' for system fees (memberships, boosts)
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL, -- 'TAB', 'XPR', 'XUSDC', 'XMD', 'METAL', 'LOAN', 'XMT'
  type TEXT NOT NULL, -- 'tip', 'vote', 'activation', 'boost'
  memo TEXT,
  week_identifier TEXT, -- 'Q2026-2' etc. for quarterly rewards
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Grant API Access to authenticated and anonymous connections
GRANT SELECT, INSERT ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT ON TABLE public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

GRANT SELECT, INSERT ON TABLE public.platform_transactions TO authenticated;
GRANT SELECT, INSERT ON TABLE public.platform_transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_transactions TO service_role;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Create Security Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated upsert to profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to transactions" ON public.platform_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public inserts to transactions" ON public.platform_transactions FOR INSERT WITH CHECK (true);