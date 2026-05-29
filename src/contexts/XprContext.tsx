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
  setIsMember: (status: boolean) => void;
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
        const mapped: Creator[] = data.map(item => ({
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

      if (ROOT_ADMINS.includes(account)) {
        currentlyMember = true;
        activeDateStr = new Date(2099, 11, 31).toISOString();
        setIsMember(true);
        setMembershipDate(activeDateStr);
      } else {
        const membershipKey = `tiptab_membership_${account}`;
        const membershipDateKey = `tiptab_membership_date_${account}`;
        const savedDate = localStorage.getItem(membershipDateKey);
        if (savedDate) {
          const activationDate = new Date(savedDate);
          const now = new Date();
          const diffYears = (now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          if (diffYears < 1) { 
            currentlyMember = true;
            activeDateStr = savedDate;
            setIsMember(true); 
            setMembershipDate(savedDate); 
          }
          else { 
            setIsMember(false); 
            setMembershipDate(null); 
            localStorage.removeItem(membershipKey); 
          }
        } else if (localStorage.getItem(membershipKey) === 'true') {
          const fakeDate = new Date().toISOString();
          localStorage.setItem(membershipDateKey, fakeDate);
          currentlyMember = true;
          activeDateStr = fakeDate;
          setMembershipDate(fakeDate);
          setIsMember(true);
        } else { 
          setIsMember(false); 
          setMembershipDate(null); 
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
      try {
        await session.remove();
      } catch (err) {
        console.warn("On-chain session removal warning:", err);
      }
    }
    localStorage.removeItem("tiptab_has_session");
    setSession(null);
    setBalances({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', xmt: '0.00000000', tipsSent: 0 });
    setIsMember(false);
    setMembershipDate(null);
    setUserProfile(null);
    localStorage.removeItem("tiptab_user_profile");
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
          cover_image: profile.cover_image || "",
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
          instagram_live: profile.instagram_live || "",
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
    session, actor: activeActor, balances, isMember, membershipDate, setIsMember, login, logout, refreshBalances, recordTip,
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