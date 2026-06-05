"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
import { supabase } from "@/integrations/supabase/client";
import { Creator } from '@/data/creators';
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
  runningAutoSync?: boolean;
  loginError?: string | null;
  loginStatus?: 'idle' | 'authenticating' | 'syncing' | 'connected' | 'failed';
  linkSessionId?: string | null;
  selectedEndpoint?: string;
  isCustomEndpoint?: boolean;
  setCustomEndpoint?: (endpoint: string) => void;
  refreshBalances: () => Promise<void>;
  recordTip: (amount: number) => void;
  recordTxInDb: (sender: string, recipient: string, amount: number, asset: string, type: string, memo?: string, weekId?: string) => Promise<void>;
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
  updateUserProfile: (profile: Creator) => Promise<boolean>;
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

// Safe helper to parse coordinates from Postgres curly braces or standard arrays
const parseCoords = (coords: any): [number, number] => {
  if (!coords) return [0, 0];
  if (Array.isArray(coords)) {
    return [
      typeof coords[0] === 'string' ? parseFloat(coords[0]) : Number(coords[0] || 0),
      typeof coords[1] === 'string' ? parseFloat(coords[1]) : Number(coords[1] || 0)
    ];
  }
  if (typeof coords === 'string') {
    const match = coords.match(/\{?(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\}?/);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[2])];
    }
  }
  return [0, 0];
};

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_member', true)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        const mapped: Creator[] = data
          .filter(item => item.handle.toLowerCase().trim() !== 'crownxpr')
          .map(item => ({
            id: `user_${item.handle}`,
            name: item.name || item.handle,
            handle: item.handle,
            bio: item.bio || "",
            location: item.location || "",
            coordinates: parseCoords(item.coordinates),
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

  const recordTxInDb = async (
    sender: string,
    recipient: string,
    amount: number,
    asset: string,
    type: string,
    memo?: string,
    weekId?: string
  ) => {
    try {
      await supabase.from('platform_transactions').insert({
        sender_handle: sender.toLowerCase().replace('@', '').trim(),
        recipient_handle: recipient.toLowerCase().replace('@', '').trim(),
        amount,
        asset: asset.toUpperCase().trim(),
        type,
        memo: memo || "",
        week_identifier: weekId || null
      });
    } catch (err) {
      console.error("Failed to insert transaction metadata in Supabase:", err);
    }
  };

  useEffect(() => {
    const purgeSpecificAccount = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ is_member: false })
          .eq('handle', 'crownxpr');
        fetchDbCreators();
      } catch (e) {
        console.error("Manual purge error:", e);
      }
    };
    purgeSpecificAccount();
  }, [fetchDbCreators]);

  useEffect(() => {
    const keepAlive = async () => {
      const lastPing = localStorage.getItem('supabase_keep_alive');
      const now = Date.now();
      if (!lastPing || now - parseInt(lastPing) > 86400000) {
        try {
          await supabase.from('platform_settings').select('id').limit(1);
          localStorage.setItem('supabase_keep_alive', now.toString());
        } catch (e) { /* ignore */ }
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
      
      // Persist transaction record directly to Supabase
      const actorName = session.auth.actor.toString();
      const amountNum = parseFloat(price);
      await recordTxInDb(actorName, 'tiptab', amountNum, asset, 'boost', `Boosted @${handle}`);

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

      // Secure, database-first validation of active memberships
      const { data: dbProfile, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', account)
        .maybeSingle();
      
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
      } else if (dbProfile && !dbError) {
        currentlyMember = dbProfile.is_member === true;
        if (currentlyMember) {
          setIsMember(true);
          const hasProFeatures = dbProfile.cover_image || dbProfile.twitch || dbProfile.youtube_live || dbProfile.kick || dbProfile.rumble || (dbProfile.categories && dbProfile.categories.length > 1);
          level = hasProFeatures ? 'pro' : 'basic';
          setMembershipLevel(level);

          const savedDate = localStorage.getItem(`tiptab_membership_date_${account}`);
          activeDateStr = savedDate || dbProfile.created_at || new Date().toISOString();
          setMembershipDate(activeDateStr);

          localStorage.setItem(`tiptab_membership_${account}`, 'true');
          localStorage.setItem(`tiptab_membership_level_${account}`, level);
          if (level === 'pro') {
            localStorage.setItem(`tiptab_membership_date_${account}`, activeDateStr);
          }
        } else {
          setIsMember(false);
          setMembershipDate(null);
          setMembershipLevel(null);
          localStorage.removeItem(`tiptab_membership_${account}`);
          localStorage.removeItem(`tiptab_membership_date_${account}`);
          localStorage.removeItem(`tiptab_membership_level_${account}`);
        }
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
          } else { 
            setIsMember(false); 
            setMembershipDate(null); 
            setMembershipLevel(null);
            localStorage.removeItem(membershipKey); 
          }
        } else if (localStorage.getItem(membershipKey) === 'true') {
          currentlyMember = true;
          setIsMember(true);
          level = storedLevel || 'basic';
          setMembershipLevel(level);
        } else { 
          setIsMember(false); 
          setMembershipDate(null); 
          setMembershipLevel(null);
        }
      }

      if (dbProfile && !dbError) {
        const mappedProfile: Creator = {
          id: `user_${account}`,
          name: dbProfile.name || account,
          handle: dbProfile.handle,
          bio: dbProfile.bio || "",
          location: dbProfile.location || "",
          coordinates: parseCoords(dbProfile.coordinates),
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
          }, { onConflict: 'handle' });
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
          }, { onConflict: 'handle' });
        }
      }
    } catch (error) { console.error('Balance sync error:', error); }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      await fetchDbCreators();
      
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

  // Secure update with on-chain cryptographic signature verification via Edge Function
  const updateUserProfile = async (profile: Creator): Promise<boolean> => {
    if (!session || !activeActor) return false;

    try {
      const membershipKey = `tiptab_membership_${activeActor}`;
      const activeMember = isMember || localStorage.getItem(membershipKey) === 'true';
      const proofMemo = `Update Profile Proof: ${Date.now()}`;

      // 1. Prompt WebAuth to sign a completely free 0.0000 XPR verification proof transfer
      const actions = [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: activeActor,
          permission: session.auth.permission || 'active',
        }],
        data: {
          from: activeActor,
          to: 'tiptab',
          quantity: '0.0000 XPR',
          memo: proofMemo,
        },
      }];

      const transactResult = await session.transact({ actions }, { broadcast: true });
      const transactionId = transactResult.processed.id;

      // 2. Invoke our secure update-profile Supabase Edge Function to verify on-chain and save
      const { data, error } = await supabase.functions.invoke('update-profile', {
        body: {
          profile: {
            ...profile,
            isMember: activeMember
          },
          actor: activeActor,
          transactionId
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || "Edge verification validation failed.");
      }

      // 3. Update local caches once backend-verified
      localStorage.setItem(`tiptab_profile_${activeActor}`, JSON.stringify(profile));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(profile));
      setUserProfile(profile);
      
      // Update our global candidate array
      await fetchDbCreators();
      return true;

    } catch (err: any) {
      console.error("Secure profile update failed:", err);
      
      // Fallback: Notify user clearly of authentication error or signature cancel
      throw new Error(err.message || "Crypto proof transaction not completed. Profile changes rejected.");
    }
  };

  const value = {
    session, actor: activeActor, balances, isMember, membershipDate, membershipLevel, setIsMember, setMembershipDate, setMembershipLevel, login, logout, refreshBalances, recordTip,
    recordTxInDb, isConnected: !!session, isLoading, isAdmin: !!adminHook.currentAdminObj, adminRole: adminHook.currentAdminObj ? adminHook.currentAdminObj.role : null,
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