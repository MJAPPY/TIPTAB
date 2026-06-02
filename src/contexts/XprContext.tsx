"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
import { supabase } from "@/integrations/supabase/client";
import { CREATORS, Creator } from '@/data/creators';
import { Balances, PromoCode, AdminUser } from '@/types/xpr';
import { PROTON_ENDPOINTS, APP_IDENTIFIER, ROOT_ADMINS, TOKENS } from '@/constants/xpr';
import { useXprAdmin } from '@/hooks/useXprAdmin';
import { useXprPlatform } from '@/hooks/useXprPlatform';
import { useXprSocial } from '@/hooks/useXprSocial';

// Re-export types for backward compatibility in components
export type { Balances, PromoCode, AdminUser };

interface XprContextType {
  session: LinkSession | null;
  actor: string | null;
  balances: Balances;
  isMember: boolean;
  membershipDate: string | null;
  membershipLevel: 'basic' | 'pro' | null;
  setIsMember: (status: boolean) => void;
  setMembershipDate: (date: string | null) => void;
  setMembershipLevel: (level: 'basic' | 'pro' | null) => void;
  login: () => Promise<LinkSession | null>;
  logout: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  recordTip: (amount: number) => void;
  isConnected: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  adminRole: 'super' | 'moderator' | 'treasurer' | null;
  isPermanentAdmin: boolean; 
  adminsList: AdminUser[];
  addAdmin: (handle: string, role: 'super' | 'moderator' | 'treasurer') => void;
  removeAdmin: (id: string) => void;
  updateAdminRole: (id: string, role: 'super' | 'moderator' | 'treasurer') => void;
  makeAdminPermanent: (id: string, status: boolean) => void; 
  userProfile: Creator | null;
  updateUserProfile: (profile: Creator) => void;
  isMaintenanceMode: boolean;
  setMaintenanceMode: (status: boolean) => void;
  networkAlert: string | null;
  broadcastAlert: (message: string | null) => void;
  membershipFee: string;
  membershipFeeXmd: string;
  membershipFeeXusdc: string;
  membershipFeeMetal: string;
  membershipFeeLoan: string;
  membershipFeeXmt: string;
  updateMembershipFee: (fee: string, asset?: 'XPR' | 'XMD' | 'XUSDC' | 'METAL' | 'LOAN' | 'XMT') => void;
  boostPrice: string;
  updateBoostPrice: (price: string) => void;
  boostTabPrice: string;
  updateBoostTabPrice: (price: string) => void;
  boostPriceXusdc: string;
  updateBoostPriceXusdc: (price: string) => void;
  featuredHandles: string[];
  boostStream: (handle: string, asset?: 'XPR' | 'TAB') => Promise<boolean>;
  distributeXprRewards: (winners: { account: string; amount: string }[]) => Promise<boolean>;
  promoCodes: PromoCode[];
  createPromoCode: (code: string, type: 'free' | 'percent', value: number, maxUses: number) => void;
  deletePromoCode: (id: string) => void;
  applyPromoCode: (code: string) => PromoCode | null;
  usePromoCode: (code: string) => void;
  favorites: string[];
  toggleFavorite: (handle: string) => void;
  isFavorite: (handle: string) => boolean;
  liveActivities: any[];
  resetLiveTicker: () => void;
  syncPlatformSettings: () => Promise<void>;
  dbCreators: Creator[];
  fetchDbCreators: () => Promise<void>;
}

const XprContext = createContext<XprContextType | undefined>(undefined);

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', xmt: '0.00000000', tipsSent: 0 });
  const [isMember, setIsMember] = useState(false);
  const [membershipDate, setMembershipDate] = useState<string | null>(null);
  const [membershipLevel, setMembershipLevel] = useState<'basic' | 'pro' | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_has_session") === "true";
    }
    return true;
  });
  const [userProfile, setUserProfile] = useState<Creator | null>(null);
  const [dbCreators, setDbCreators] = useState<Creator[]>([]);
  const [featuredHandles, setFeaturedHandles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_featured_handles");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const activeActor = session ? session.auth.actor.toString() : null;

  // Domain specialized hooks
  const adminHook = useXprAdmin(activeActor);
  const platformHook = useXprPlatform(adminHook.currentAdminObj);
  const socialHook = useXprSocial(activeActor);

  const fetchDbCreators = useCallback(async () => {
    try {
      // Query strictly active members for global viewports
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_member', true)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        const mapped: Creator[] = data
          .filter(item => item.handle.toLowerCase() !== 'crownxpr') // Exclude crownxpr
          .map(item => ({
            id: `user_${item.handle}`,
            name: item.name || item.handle,
            handle: item.handle,
            bio: item.bio || "",
            location: item.location || "",
            coordinates: item.coordinates || [0, 0],
            categories: item.categories || ["Other"],
            avatar: item.avatar || item.handle.slice(0, 2).toUpperCase(),
            avatarImage: item.avatar_image || "",
            coverImage: item.cover_image || "",
            coverPosition: item.cover_position ?? 50,
            color: item.color || "bg-purple-600",
            twitter: item.twitter || "",
            website: item.website || "",
            videoUrl: item.video_url || "",
            instagram: item.instagram || "",
            spotify: item.spotify || "",
            snipverse: item.snipverse || "",
            facebook: item.facebook || "",
            kick: item.kick || "",
            rumble: item.rumble || "",
            twitch: item.twitch || "",
            tiktok: item.tiktok || "",
            youtubeLive: item.youtube_live || "",
            instagramLive: item.instagram_live || "",
            membershipLevel: item.cover_image || item.twitch || item.youtube_live || item.kick || item.rumble || (item.categories && item.categories.length > 1) ? 'pro' : 'basic'
          }));
        setDbCreators(mapped);
      }
    } catch (e) {
      console.error("Error fetching creators from Supabase:", e);
    }
  }, []);

  // Supabase Keep-Alive to prevent auto-pause (Free Tier)
  useEffect(() => {
    const keepAlive = async () => {
      const lastPing = localStorage.getItem('supabase_keep_alive');
      const now = Date.now();
      // Only ping if last ping was more than 24h ago to keep it ultra light
      if (!lastPing || now - parseInt(lastPing) > 86400000) {
        try {
          await supabase.from('platform_settings').select('id').limit(1);
          localStorage.setItem('supabase_keep_alive', now.toString());
        } catch (e) { /* ignore ping errors */ }
      }
    };
    keepAlive();
  }, []);

  const boostStream = async (handle: string, asset: 'XPR' | 'TAB' = 'XPR'): Promise<boolean> => {
    if (!session || !isMember) return false;
    try {
      const price = asset === 'XPR' ? platformHook.boostPrice : platformHook.boostTabPrice;
      const contract = asset === 'XPR' ? 'eosio.token' : 'tokencreate';
      const precision = asset === 'XPR' ? 4 : 0;
      const formattedAmount = precision === 0 ? `${Math.floor(parseFloat(price))} ${asset}` : `${parseFloat(price).toFixed(precision)} ${asset}`;
      const action = {
        account: contract,
        name: 'transfer',
        authorization: [{ actor: session.auth.actor, permission: session.auth.permission }],
        data: { from: session.auth.actor, to: 'tiptab', quantity: formattedAmount, memo: `Boost: ${handle.slice(0, 16)}` },
      };
      await session.transact({ actions: [action] }, { broadcast: true });
      const newFeatured = [...featuredHandles, handle.replace('@', '').toLowerCase()];
      setFeaturedHandles(newFeatured);
      localStorage.setItem("tiptab_featured_handles", JSON.stringify(newFeatured));
      return true;
    } catch (e) { return false; }
  };

  const distributeXprRewards = async (winners: { account: string; amount: string }[]) => {
    if (!session || !adminHook.currentAdminObj || (adminHook.currentAdminObj.role !== 'super' && adminHook.currentAdminObj.role !== 'treasurer')) return false;
    try {
      const actions = winners.map(winner => ({
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{ actor: session.auth.actor, permission: session.auth.permission }],
        data: { from: activeActor, to: winner.account, quantity: `${parseFloat(winner.amount).toFixed(4)} XPR`, memo: 'TIPTAB Network Reward' },
      }));
      await session.transact({ actions }, { broadcast: true });
      return true;
    } catch (e) { return false; }
  };

  const recordTip = useCallback((amount: number) => {
    if (!session?.auth.actor) return;
    const actorName = session.auth.actor.toString();
    const key = `tiptab_tips_sent_${actorName}`;
    const current = parseInt(localStorage.getItem(key) || "0");
    const updated = current + amount;
    localStorage.setItem(key, updated.toString());
    setBalances(prev => ({ ...prev, tipsSent: updated }));
  }, [session]);

  const fetchBalances = useCallback(async (account: string) => {
    if (!account) return;
    try {
      const primaryEndpoint = PROTON_ENDPOINTS[0];
      const headers = { 'Content-Type': 'application/json' };
      const balanceRequests = TOKENS.map(token => 
        fetch(`${primaryEndpoint}/v1/chain/get_currency_balance`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ code: token.code, account, symbol: token.symbol })
        }).then(res => res.ok ? res.json() : [])
      );
      const results = await Promise.all(balanceRequests);
      const newBalances: any = {};
      results.forEach((data, index) => {
        const token = TOKENS[index];
        if (data[0]) {
          const val = data[0].split(' ')[0];
          newBalances[token.symbol.toLowerCase()] = token.precision === 0 ? Math.floor(parseFloat(val)).toString() : parseFloat(val).toFixed(token.precision);
        } else {
          newBalances[token.symbol.toLowerCase()] = token.precision === 0 ? '0' : (0).toFixed(token.precision);
        }
      });
      const savedTips = parseInt(localStorage.getItem(`tiptab_tips_sent_${account}`) || "0");
      setBalances({ ...newBalances, tipsSent: savedTips });
      
      let currentlyMember = false;
      let activeDateStr = null;
      let level: 'basic' | 'pro' | null = null;

      if (ROOT_ADMINS.includes(account)) {
        currentlyMember = true;
        activeDateStr = new Date(2099, 11, 31).toISOString();
        setIsMember(true);
        setMembershipDate(activeDateStr);
        setMembershipLevel('pro');
        level = 'pro';
      } else {
        const membershipKey = `tiptab_membership_${account}`;
        const membershipDateKey = `tiptab_membership_date_${account}`;
        const savedDate = localStorage.getItem(membershipDateKey);
        const storedLevel = localStorage.getItem(`tiptab_membership_level_${account}`) as 'basic' | 'pro' | null;

        if (savedDate) {
          const activationDate = new Date(savedDate);
          const now = new Date();
          const diffYears = (now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          if (diffYears < 1) { 
            currentlyMember = true;
            activeDateStr = savedDate;
            setIsMember(true); 
            setMembershipDate(savedDate); 
            setMembershipLevel('pro');
            level = 'pro';
          }
          else { 
            setIsMember(false); 
            setMembershipDate(null); 
            setMembershipLevel(null);
            localStorage.removeItem(membershipKey); 
          }
        } else if (localStorage.getItem(membershipKey) === 'true') {
          currentlyMember = true;
          setIsMember(true);
          if (storedLevel === 'basic') {
            setMembershipLevel('basic');
            level = 'basic';
          } else {
            const fakeDate = new Date().toISOString();
            localStorage.setItem(membershipDateKey, fakeDate);
            activeDateStr = fakeDate;
            setMembershipDate(fakeDate);
            setMembershipLevel('pro');
            level = 'pro';
          }
        } else { 
          setIsMember(false); 
          setMembershipDate(null); 
          setMembershipLevel(null);
        }
      }

      // Sync user profile from Supabase first
      const { data: dbProfile, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', account)
        .maybeSingle();

      if (dbProfile && !dbError) {
        const mappedProfile: Creator = {
          id: `user_${account}`,
          name: dbProfile.name || account,
          handle: dbProfile.handle,
          bio: dbProfile.bio || "",
          location: dbProfile.location || "",
          coordinates: dbProfile.coordinates || [0, 0],
          categories: dbProfile.categories || ["Other"],
          avatar: dbProfile.avatar || account.slice(0, 2).toUpperCase(),
          avatarImage: dbProfile.avatar_image || "",
          coverImage: dbProfile.cover_image || "",
          coverPosition: dbProfile.cover_position ?? 50,
          color: dbProfile.color || "bg-purple-600",
          twitter: dbProfile.twitter || "",
          website: dbProfile.website || "",
          videoUrl: dbProfile.video_url || "",
          instagram: dbProfile.instagram || "",
          spotify: dbProfile.spotify || "",
          snipverse: dbProfile.snipverse || "",
          facebook: dbProfile.facebook || "",
          kick: dbProfile.kick || "",
          rumble: dbProfile.rumble || "",
          twitch: dbProfile.twitch || "",
          tiktok: dbProfile.tiktok || "",
          youtubeLive: dbProfile.youtube_live || "",
          instagramLive: dbProfile.instagram_live || "",
        };
        setUserProfile(mappedProfile);
        localStorage.setItem(`tiptab_profile_${account}`, JSON.stringify(mappedProfile));
        localStorage.setItem("tiptab_user_profile", JSON.stringify(mappedProfile));
      } else {
        const savedProfile = localStorage.getItem(`tiptab_profile_${account}`);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setUserProfile(parsed);
          // Auto-sync local backup to database
          await supabase.from('profiles').upsert({
            handle: account,
            name: parsed.name,
            bio: parsed.bio,
            location: parsed.location,
            coordinates: parsed.coordinates,
            categories: parsed.categories,
            avatar: parsed.avatar,
            avatar_image: parsed.avatarImage,
            cover_image: parsed.coverImage,
            cover_position: parsed.coverPosition,
            color: parsed.color,
            twitter: parsed.twitter,
            website: parsed.website,
            video_url: parsed.videoUrl,
            instagram: parsed.instagram,
            spotify: parsed.spotify,
            snipverse: parsed.snipverse,
            facebook: parsed.facebook,
            kick: parsed.kick,
            rumble: parsed.rumble,
            twitch: parsed.twitch,
            tiktok: parsed.tiktok,
            youtube_live: parsed.youtubeLive,
            instagram_live: parsed.instagramLive,
            is_member: currentlyMember
          });
        } else {
          // Explicitly block setting up crownxpr profile on load
          if (account.toLowerCase() === 'crownxpr') return;

          const newProfile: Creator = {
            id: `user_${account}`,
            name: account,
            handle: account,
            bio: "Just joined the TIP TAB network!",
            location: "",
            coordinates: [0, 0],
            categories: ["Other"],
            avatar: account.slice(0, 2).toUpperCase(),
            color: "bg-purple-600"
          };
          setUserProfile(newProfile);
          localStorage.setItem("tiptab_user_profile", JSON.stringify(newProfile));
          
          // Initial profile sync to Supabase database
          await supabase.from('profiles').upsert({
            handle: account,
            name: account,
            bio: "Just joined the TIP TAB network!",
            location: "",
            coordinates: [0, 0],
            categories: ["Other"],
            avatar: account.slice(0, 2).toUpperCase(),
            color: "bg-purple-600",
            is_member: currentlyMember
          });
        }
      }
    } catch (error) { console.error('Balance sync error:', error); }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      await fetchDbCreators(); // Load global database profiles on load
      
      const hasSavedSession = localStorage.getItem("tiptab_has_session") === "true";
      if (!hasSavedSession) {
        setIsLoading(false);
        return;
      }

      const { session: restoredSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS, restoreSession: true },
        transportOptions: { requestAccount: APP_IDENTIFIER },
        selectorOptions: { },
      });
      if (restoredSession) {
        setSession(restoredSession);
        await fetchBalances(restoredSession.auth.actor.toString());
      } else {
        localStorage.removeItem("tiptab_has_session");
      }
    } catch (error) { 
      console.error('Session restoration error:', error); 
      localStorage.removeItem("tiptab_has_session");
    } finally { 
      setIsLoading(false); 
    }
  }, [fetchBalances, fetchDbCreators]);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = async () => {
    try {
      const { session: newSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS },
        transportOptions: { requestAccount: APP_IDENTIFIER },
        selectorOptions: { },
      });
      if (newSession) {
        localStorage.setItem("tiptab_has_session", "true");
        setSession(newSession);
        await fetchBalances(newSession.auth.actor.toString());
        return newSession;
      }
      return null;
    } catch (error) { throw error; }
  };

  const logout = async () => {
    if (session) {
      await session.remove();
      localStorage.removeItem("tiptab_has_session");
      setSession(null);
      setBalances({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', xmt: '0.00000000', tipsSent: 0 });
      setIsMember(false);
      setMembershipDate(null);
      setMembershipLevel(null);
      setUserProfile(null);
      localStorage.removeItem("tiptab_user_profile");
    }
  };

  const refreshBalances = async () => { if (session) await fetchBalances(session.auth.actor.toString()); };

  const updateUserProfile = async (profile: Creator) => {
    if (session?.auth.actor) {
      const actorName = session.auth.actor.toString();
      localStorage.setItem(`tiptab_profile_${actorName}`, JSON.stringify(profile));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(profile));
      setUserProfile(profile);

      // Save global profile to Supabase
      try {
        const membershipKey = `tiptab_membership_${actorName}`;
        const activeMember = isMember || localStorage.getItem(membershipKey) === 'true';

        await supabase.from('profiles').upsert({
          handle: actorName,
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          coordinates: profile.coordinates,
          categories: profile.categories,
          avatar: profile.avatar,
          avatar_image: profile.avatarImage || "",
          cover_image: profile.coverImage || "",
          cover_position: profile.coverPosition ?? 50,
          color: profile.color,
          twitter: profile.twitter || "",
          website: profile.website || "",
          video_url: profile.videoUrl || "",
          instagram: profile.instagram || "",
          spotify: profile.spotify || "",
          snipverse: profile.snipverse || "",
          facebook: profile.facebook || "",
          kick: profile.kick || "",
          rumble: profile.rumble || "",
          twitch: profile.twitch || "",
          tiktok: profile.tiktok || "",
          youtube_live: profile.youtubeLive || "",
          instagram_live: profile.instagramLive || "",
          is_member: activeMember
        });
        // Re-fetch creator list to immediately update live preview
        fetchDbCreators();
      } catch (err) {
        console.error("Failed to sync profile to Supabase", err);
      }
    }
  };

  const value = {
    session, actor: activeActor, balances, isMember, membershipDate, membershipLevel, setIsMember, setMembershipDate, setMembershipLevel, login, logout, refreshBalances, recordTip,
    isConnected: !!session, isLoading, isAdmin: !!adminHook.currentAdminObj, adminRole: adminHook.currentAdminObj ? adminHook.currentAdminObj.role : null,
    isPermanentAdmin: adminHook.isCurrentAdminPermanent, ...adminHook, ...platformHook, ...socialHook,
    userProfile, updateUserProfile, featuredHandles, boostStream, distributeXprRewards, dbCreators, fetchDbCreators
  };

  return <XprContext.Provider value={value}>{children}</XprContext.Provider>;
};

export const useXpr = () => {
  const context = useContext(XprContext);
  if (context === undefined) throw new Error('useXpr must be used within an XprProvider');
  return context;
};
</dyad-file>

<dyad-write path="src/components/Tab.tsx" description="Update displayCreators list memo to strictly filter out crownxpr from home page listings.">
"use client";

import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Header } from "./tab-platform/Header";
import { Hero } from "./tab-platform/Hero";
import { StatsBanner } from "./tab-platform/Sections";
import { WorldMap } from "./tab-platform/WorldMap";
import { TopVotedCreators } from "./tab-platform/TopVotedCreators";
import { FeaturedCreators } from "./tab-platform/FeaturedCreators";
import { HowItWorks } from "./tab-platform/HowItWorks";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { TippingModal } from "./tab-platform/TippingModal";
import { ActivityTicker } from "./tab-platform/ActivityTicker";
import { Toaster } from "@/components/ui/toaster";
import { Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";
import { supabase } from "@/integrations/supabase/client";

export const Tab = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const { actor, userProfile, isMember, dbCreators } = useXpr();
  const [topVotedHandles, setTopVotedHandles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopVoted = async () => {
      const year = new Date().getFullYear();
      const quarter = Math.floor(new Date().getMonth() / 3) + 1;
      const quarterId = `Q${year}-${quarter}`;

      const { data, error } = await supabase
        .from('votes')
        .select('candidate_handle, tab_amount')
        .eq('week_identifier', quarterId);

      if (data && !error) {
        const totals: Record<string, number> = {};
        data.forEach(v => {
          totals[v.candidate_handle] = (totals[v.candidate_handle] || 0) + Number(v.tab_amount);
        });
        const sorted = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([handle]) => handle);
        setTopVotedHandles(sorted);
      }
    };
    fetchTopVoted();
  }, []);

  // Optimized logic to ensure local user profile overrides seed data on the map and lists
  // AND priorities Top Voted pros for the Hero section display logic
  const displayCreators = useMemo(() => {
    let list = [...dbCreators].filter(c => c.handle.toLowerCase() !== 'crownxpr');

    if (actor && userProfile && actor.toLowerCase() !== 'crownxpr') {
      const cleanActor = actor.toLowerCase();
      const membershipKey = `tiptab_membership_${actor}`;
      const isActuallyMember = isMember || localStorage.getItem(membershipKey) === 'true';

      if (isActuallyMember) {
        const existsIdx = list.findIndex(c => c.handle.toLowerCase() === cleanActor);
        if (existsIdx !== -1) {
          list[existsIdx] = userProfile;
        } else {
          list = [userProfile, ...list];
        }
      }
    }
    
    return list;
  }, [actor, userProfile, isMember, dbCreators]);

  const heroCreators = useMemo(() => {
    if (topVotedHandles.length > 0) {
      const voted = displayCreators.filter(c => topVotedHandles.includes(c.handle.toLowerCase().replace('@', '')));
      if (voted.length > 0) return voted;
    }
    return displayCreators;
  }, [displayCreators, topVotedHandles]);

  const handleViewProfile = (creator: Creator) => {
    navigate(`/tip/${creator.handle}`);
  };

  const handleOpenTipping = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <ActivityTicker />
      
      <main className="pt-24 md:pt-32">
        <div className="relative">
          <Hero creators={heroCreators} onJoin={() => setIsMembershipOpen(true)} />
        </div>
        <StatsBanner />
        
        <section className="py-12 container mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-purple-500 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">Live on XPR Network</h2>
            <span className="text-white/40 text-[10px] sm:text-xs">— click a pin to view profile</span>
          </div>
          <WorldMap creators={displayCreators} onSelectCreator={handleViewProfile} />
        </section>

        <HowItWorks />

        <TopVotedCreators 
          creators={displayCreators}
          topVotedHandles={topVotedHandles}
          onViewProfile={handleViewProfile}
        />

        <FeaturedCreators 
          creators={displayCreators}
          onSelectCreator={handleOpenTipping} 
          onViewProfile={handleViewProfile}
          onAddYourself={() => setIsMembershipOpen(true)} 
        />
      </main>
      
      <footer className="py-16 sm:py-24 border-t border-white/5 bg-black/20 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8 sm:mb-12 flex flex-col items-center gap-4 sm:gap-6 inline-flex">
            <Link to="/" className="flex flex-col items-center gap-4 sm:gap-8 group">
              <img src="/logo.png" alt="TIPTAB Logo" className="h-24 w-24 sm:h-40 sm:w-40 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-105 transition-transform duration-500" />
              <span className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white group-hover:text-[#a855f7] transition-colors duration-300">
                TIP<span className="text-orange-500">TAB</span>
              </span>
            </Link>
            <Link to="/showcase" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all shadow-[0_0_20px_rgba(168,85,247,0.15)] animate-pulse">
              <Sparkles className="h-3.5 w-3.5 fill-purple-400" />
              XPR Site Showcase
            </Link>
          </div>
          <div className="space-y-4 mb-10 sm:mb-12 max-w-xl mx-auto px-4">
            <p className="text-white/40 text-sm sm:text-lg font-medium">
              Empowering the global workforce through direct, fee-free tipping on the <span className="text-purple-400">XPR Network</span>. Join the future of appreciation.
            </p>
            <p className="text-orange-500/80 font-black italic tracking-tight text-lg sm:text-xl uppercase drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              “Tipping is the appreciation of value”
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-white/60 font-bold text-sm sm:text-base">
            <Link to="/docs" className="hover:text-purple-400 transition-colors">FAQ</Link>
            <Link to="/assets" className="hover:text-orange-400 transition-colors">Assets</Link>
            <a 
              href="https://x.com/tabtokenxpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors"
            >
              X
            </a>
            <a 
              href="https://snipverse.com/tabxpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors"
            >
              Snipverse
            </a>
            <Link to="/docs?section=support" className="hover:text-orange-400 transition-colors">Support Hub</Link>
          </div>
          <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 text-white/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] px-4">
            © {new Date().getFullYear()} TIPTAB Platform. SECURED BY XPR NETWORK.
          </div>
        </div>
      </footer>
      
      <MembershipModal 
        isOpen={isMembershipOpen} 
        onOpenChange={setIsMembershipOpen} 
      />

      <TippingModal 
        creator={selectedCreator} 
        onClose={() => setSelectedCreator(null)} 
      />
      
      <Toaster />
    </div>
  );
};