"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
import { CREATORS, Creator } from '@/data/creators';
import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  type: 'free' | 'percent';
  value: number; 
  maxUses: number;
  uses: number;
}

export interface AdminUser {
  id: string;
  handle: string;
  role: 'super' | 'moderator' | 'treasurer';
  isPermanent?: boolean; 
}

interface Balances {
  xpr: string;
  tab: string;
  xmd: string;
  xusdc: string;
  metal: string;
  loan: string;
  tipsSent: number;
}

const DEFAULT_ACTIVITIES = [
  { id: 1, icon: "Zap", text: "New Tip: 500 TAB sent to @alex_arts", color: "text-orange-500" },
  { id: 2, icon: "Sparkles", text: "@sarahcodes just joined the global map!", color: "text-purple-400" },
  { id: 3, icon: "TrendingUp", text: "Network Milestone: 1.2M TAB tipped globally", color: "text-green-400" },
  { id: 4, icon: "Heart", text: "Top Supporter: 0x71...4F2a sent a 5,000 TAB tip!", color: "text-pink-500" },
  { id: 5, icon: "Zap", text: "New Tip: 250 TAB sent to @priyatech", color: "text-orange-500" },
  { id: 6, icon: "Sparkles", text: "@mwright is now a verified creator", color: "text-purple-400" },
];

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
  updateMembershipFee: (fee: string, asset?: 'XPR' | 'XMD' | 'XUSDC') => void;
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
  // Favorites System
  favorites: string[];
  toggleFavorite: (handle: string) => void;
  isFavorite: (handle: string) => boolean;
  // Live Ticker Feed
  liveActivities: any[];
  resetLiveTicker: () => void;
  syncPlatformSettings: () => Promise<void>;
}

const XprContext = createContext<XprContextType | undefined>(undefined);

const PROTON_ENDPOINTS = [
  'https://api.protonnz.com',
  'https://proton.eosusa.io',
  'https://proton.cryptolions.io',
  'https://api.protonchain.com'
];

const APP_IDENTIFIER = 'tiptab';
const APP_NAME = 'TIPTAB';
const APP_LOGO = 'https://explorer.xprnetwork.org/api/account/tiptab/avatar';

const TOKENS = [
  { symbol: 'XPR', code: 'eosio.token', precision: 4 },
  { symbol: 'TAB', code: 'tokencreate', precision: 0 },
  { symbol: 'XMD', code: 'monedatoken', precision: 6 },
  { symbol: 'XUSDC', code: 'xtokens', precision: 6 },
  { symbol: 'METAL', code: 'token.metal', precision: 8 },
  { symbol: 'LOAN', code: 'loan.token', precision: 4 },
];

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ 
    xpr: '0.0000', 
    tab: '0', 
    xmd: '0.000000', 
    xusdc: '0.000000', 
    metal: '0.00000000', 
    loan: '0.0000', 
    tipsSent: 0 
  });
  const [isMember, setIsMember] = useState(false);
  const [membershipDate, setMembershipDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Creator | null>(null);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [liveActivities, setLiveActivities] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_live_activities");
      return saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
    }
    return DEFAULT_ACTIVITIES;
  });

  const resetLiveTicker = () => {
    setLiveActivities(DEFAULT_ACTIVITIES);
    localStorage.setItem("tiptab_live_activities", JSON.stringify(DEFAULT_ACTIVITIES));
  };

  useEffect(() => {
    if (session?.auth.actor) {
      const saved = localStorage.getItem(`tiptab_favorites_${session.auth.actor}`);
      if (saved) setFavorites(JSON.parse(saved));
    } else {
      setFavorites([]);
    }
  }, [session]);

  const toggleFavorite = (handle: string) => {
    if (!session?.auth.actor) return;
    const cleanHandle = handle.toLowerCase().replace('@', '');
    const newFavorites = favorites.includes(cleanHandle)
      ? favorites.filter(h => h !== cleanHandle)
      : [...favorites, cleanHandle];
    
    setFavorites(newFavorites);
    localStorage.setItem(`tiptab_favorites_${session.auth.actor}`, JSON.stringify(newFavorites));
  };

  const isFavorite = (handle: string) => {
    return favorites.includes(handle.toLowerCase().replace('@', ''));
  };

  const [networkAlert, setNetworkAlert] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_network_alert");
    }
    return null;
  });
  
  const [membershipFee, setMembershipFee] = useState("2500");
  const [membershipFeeXmd, setMembershipFeeXmd] = useState("2.50");
  const [membershipFeeXusdc, setMembershipFeeXusdc] = useState("2.50");
  const [boostPrice, setBoostPrice] = useState("1000");
  const [boostTabPrice, setBoostTabPrice] = useState("5000");
  const [boostPriceXusdc, setBoostPriceXusdc] = useState("1.00");

  const syncPlatformSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (data && !error) {
        setMembershipFee(data.membership_fee_xpr.toString());
        setMembershipFeeXmd(data.membership_fee_xmd.toString());
        setMembershipFeeXusdc(data.membership_fee_xusdc.toString());
        setBoostPrice(data.boost_price_xpr.toString());
        setBoostTabPrice(data.boost_price_tab.toString());
        setBoostPriceXusdc(data.boost_price_xusdc.toString());
        
        // Also keep local storage in sync for redundancy
        localStorage.setItem("tiptab_membership_fee", data.membership_fee_xpr.toString());
        localStorage.setItem("tiptab_membership_fee_xmd", data.membership_fee_xmd.toString());
        localStorage.setItem("tiptab_membership_fee_xusdc", data.membership_fee_xusdc.toString());
        localStorage.setItem("tiptab_boost_price", data.boost_price_xpr.toString());
        localStorage.setItem("tiptab_boost_tab_price", data.boost_price_tab.toString());
        localStorage.setItem("tiptab_boost_xusdc_price", data.boost_price_xusdc.toString());
      }
    } catch (err) {
      console.error("Failed to sync platform settings from DB:", err);
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    syncPlatformSettings();
  }, [syncPlatformSettings]);

  const [featuredHandles, setFeaturedHandles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_featured_handles");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_maintenance") === "true";
    }
    return false;
  });

  const [adminsList, setAdminsList] = useState<AdminUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_admins_list");
      return saved ? JSON.parse(saved) : [
        { id: "root", handle: "tiptab", role: "super", isPermanent: true }
      ];
    }
    return [{ id: "root", handle: "tiptab", role: "super", isPermanent: true }];
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_promo_codes");
      return saved ? JSON.parse(saved) : [
        { id: "p1", code: "WELCOME100", type: "free", value: 100, maxUses: 50, uses: 0 },
        { id: "p2", code: "HUSTLE50", type: "percent", value: 50, maxUses: 100, uses: 0 }
      ];
    }
    return [];
  });

  const activeActor = session ? session.auth.actor : null;
  const currentAdminObj = activeActor ? adminsList.find(a => a.handle === activeActor) : null;
  const isCurrentAdminPermanent = currentAdminObj?.isPermanent === true;

  const setMaintenanceMode = (status: boolean) => {
    setIsMaintenanceMode(status);
    localStorage.setItem("tiptab_maintenance", status.toString());
  };

  const updateMembershipFee = async (fee: string, asset: 'XPR' | 'XMD' | 'XUSDC' = 'XPR') => {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (asset === 'XPR') {
      setMembershipFee(fee);
      updateData.membership_fee_xpr = parseFloat(fee);
    } else if (asset === 'XMD') {
      setMembershipFeeXmd(fee);
      updateData.membership_fee_xmd = parseFloat(fee);
    } else if (asset === 'XUSDC') {
      setMembershipFeeXusdc(fee);
      updateData.membership_fee_xusdc = parseFloat(fee);
    }
    
    await supabase.from('platform_settings').update(updateData).eq('id', 'global');
  };

  const updateBoostPrice = async (price: string) => {
    setBoostPrice(price);
    await supabase.from('platform_settings').update({ 
      boost_price_xpr: parseFloat(price),
      updated_at: new Date().toISOString()
    }).eq('id', 'global');
  };

  const updateBoostTabPrice = async (price: string) => {
    setBoostTabPrice(price);
    await supabase.from('platform_settings').update({ 
      boost_price_tab: parseFloat(price),
      updated_at: new Date().toISOString()
    }).eq('id', 'global');
  };

  const updateBoostPriceXusdc = async (price: string) => {
    setBoostPriceXusdc(price);
    await supabase.from('platform_settings').update({ 
      boost_price_xusdc: parseFloat(price),
      updated_at: new Date().toISOString()
    }).eq('id', 'global');
  };

  const broadcastAlert = (message: string | null) => {
    setNetworkAlert(message);
    if (message) {
      localStorage.setItem("tiptab_network_alert", message);
    } else {
      localStorage.removeItem("tiptab_network_alert");
    }
  };

  const addAdmin = (handle: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (!isCurrentAdminPermanent) return;
    const cleanHandle = handle.toLowerCase().trim().replace('@', '');
    if (!cleanHandle) return;
    if (adminsList.some(a => a.handle === cleanHandle)) return;
    const newAdmin: AdminUser = { id: "admin_" + Date.now(), handle: cleanHandle, role };
    const updated = [...adminsList, newAdmin];
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const removeAdmin = (id: string) => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target) return;
    if (target.isPermanent) {
      const permanentCount = adminsList.filter(a => a.isPermanent).length;
      if (permanentCount <= 1) return;
    }
    const updated = adminsList.filter(a => a.id !== id);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const updateAdminRole = (id: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target) return;
    const updated = adminsList.map(a => {
      if (a.id === id) {
        const isDemotingSuper = role !== 'super';
        return { ...a, role, isPermanent: isDemotingSuper ? false : a.isPermanent };
      }
      return a;
    });
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const makeAdminPermanent = (id: string, status: boolean) => {
    if (!isCurrentAdminPermanent) return;
    const updated = adminsList.map(a => {
      if (a.id === id) {
        return { ...a, isPermanent: status, role: status ? ('super' as const) : a.role };
      }
      return a;
    });
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const createPromoCode = (code: string, type: 'free' | 'percent', value: number, maxUses: number) => {
    const newCode: PromoCode = {
      id: "promo_" + Date.now(),
      code: code.toUpperCase().trim(),
      type,
      value: type === 'free' ? 100 : value,
      maxUses,
      uses: 0
    };
    const updated = [...promoCodes, newCode];
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const deletePromoCode = (id: string) => {
    const updated = promoCodes.filter(c => c.id !== id);
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const applyPromoCode = (code: string): PromoCode | null => {
    const cleanCode = code.toUpperCase().trim();
    const found = promoCodes.find(c => c.code === cleanCode);
    if (found && found.uses < found.maxUses) return found;
    return null;
  };

  const usePromoCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const updated = promoCodes.map(c => {
      if (c.code === cleanCode) return { ...c, uses: c.uses + 1 };
      return c;
    });
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const boostStream = async (handle: string, asset: 'XPR' | 'TAB' = 'XPR'): Promise<boolean> => {
    if (!session || !isMember) return false;
    
    try {
      const price = asset === 'XPR' ? boostPrice : boostTabPrice;
      const contract = asset === 'XPR' ? 'eosio.token' : 'tokencreate';
      const precision = asset === 'XPR' ? 4 : 0;
      
      const formattedAmount = precision === 0 
        ? `${Math.floor(parseFloat(price))} ${asset}`
        : `${parseFloat(price).toFixed(precision)} ${asset}`;

      const action = {
        account: contract,
        name: 'transfer',
        authorization: [{
          actor: session.auth.actor,
          permission: session.auth.permission,
        }],
        data: {
          from: session.auth.actor,
          to: 'tiptab',
          quantity: formattedAmount,
          memo: `Boost Performance (${asset}): ${handle}`,
        },
      };

      await session.transact({ actions: [action] }, { broadcast: true });
      
      const newFeatured = [...featuredHandles, handle.replace('@', '').toLowerCase()];
      setFeaturedHandles(newFeatured);
      localStorage.setItem("tiptab_featured_handles", JSON.stringify(newFeatured));
      
      return true;
    } catch (e) {
      console.error("Boost failed", e);
      return false;
    }
  };

  const distributeXprRewards = async (winners: { account: string; amount: string }[]) => {
    if (!session) return false;
    const actorName = session.auth.actor;
    const currentAdmin = adminsList.find(a => a.handle === actorName);
    if (!currentAdmin || (currentAdmin.role !== 'super' && currentAdmin.role !== 'treasurer')) return false;
    try {
      const actions = winners.map(winner => ({
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{ actor: actorName, permission: session.auth.permission }],
        data: {
          from: actorName,
          to: winner.account,
          quantity: `${parseFloat(winner.amount).toFixed(4)} XPR`,
          memo: 'TIPTAB Reward: Network Leaderboard Winner',
        },
      }));
      await session.transact({ actions }, { broadcast: true });
      return true;
    } catch (e) {
      console.error("Reward distribution failed", e);
      return false;
    }
  };

  const recordTip = useCallback((amount: number) => {
    if (!session?.auth.actor) return;
    const actor = session.auth.actor;
    const key = `tiptab_tips_sent_${actor}`;
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
        const key = token.symbol.toLowerCase();
        if (data[0]) {
          const val = data[0].split(' ')[0];
          newBalances[key] = token.precision === 0 ? Math.floor(parseFloat(val)).toString() : parseFloat(val).toFixed(token.precision);
        } else {
          newBalances[key] = token.precision === 0 ? '0' : (0).toFixed(token.precision);
        }
      });
      const tipsSentKey = `tiptab_tips_sent_${account}`;
      const savedTips = parseInt(localStorage.getItem(tipsSentKey) || "0");
      setBalances({ ...newBalances, tipsSent: savedTips });
      if (account === 'tiptab') {
        setIsMember(true);
        setMembershipDate(new Date(2099, 11, 31).toISOString());
      } else {
        const membershipKey = `tiptab_membership_${account}`;
        const membershipDateKey = `tiptab_membership_date_${account}`;
        const savedDate = localStorage.getItem(membershipDateKey);
        if (savedDate) {
          const activationDate = new Date(savedDate);
          const now = new Date();
          const diffYears = (now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          if (diffYears < 1) {
            setIsMember(true);
            setMembershipDate(savedDate);
          } else {
            setIsMember(false);
            setMembershipDate(null);
            localStorage.removeItem(membershipKey);
          }
        } else {
          if (localStorage.getItem(membershipKey) === 'true') {
            const fakeDate = new Date().toISOString();
            localStorage.setItem(membershipDateKey, fakeDate);
            setMembershipDate(fakeDate);
            setIsMember(true);
          } else {
            setIsMember(false);
            setMembershipDate(null);
          }
        }
      }
      const savedProfile = localStorage.getItem(`tiptab_profile_${account}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        const seedCreator = CREATORS.find(c => c.handle === account);
        const newProfile: Creator = seedCreator ? { ...seedCreator } : {
          id: `user_${account}`,
          name: account,
          handle: account,
          bio: "Just joined the TIP TAB network!",
          location: "Global",
          coordinates: [0, 0], // Valid default coordinate to prevent map crashes
          categories: ["Other"],
          avatar: account.slice(0, 2).toUpperCase(),
          color: "bg-purple-600"
        };
        setUserProfile(newProfile);
        localStorage.setItem("tiptab_user_profile", JSON.stringify(newProfile));
      }
    } catch (error) {
      console.error('Balance sync error:', error);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const { session: restoredSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS, restoreSession: true },
        transportOptions: { requestAccount: APP_IDENTIFIER, backoff: 1000 },
        selectorOptions: { appName: APP_NAME, appLogo: APP_LOGO, customStyleOptions: { modalBackgroundColor: '#0a0514', logoBackgroundColor: '#0a0514' } },
      });
      if (restoredSession) {
        setSession(restoredSession);
        await fetchBalances(restoredSession.auth.actor);
      }
    } catch (error) {
      console.error('Session restoration error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalances]);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = async () => {
    try {
      const { session: newSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS },
        transportOptions: { requestAccount: APP_IDENTIFIER },
        selectorOptions: { appName: APP_NAME, appLogo: APP_LOGO },
      });
      if (newSession) {
        setSession(newSession);
        await fetchBalances(newSession.auth.actor);
        return newSession;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (session) {
      await session.remove();
      setSession(null);
      setBalances({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', tipsSent: 0 });
      setIsMember(false);
      setMembershipDate(null);
      setUserProfile(null);
      localStorage.removeItem("tiptab_user_profile");
    }
  };

  const refreshBalances = async () => {
    if (session) await fetchBalances(session.auth.actor);
  };

  const updateUserProfile = (profile: Creator) => {
    if (session?.auth.actor) {
      localStorage.setItem(`tiptab_profile_${session.auth.actor}`, JSON.stringify(profile));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(profile));
      setUserProfile(profile);
    }
  };

  const value = {
    session,
    actor: activeActor,
    balances,
    isMember,
    membershipDate,
    setIsMember,
    login,
    logout,
    refreshBalances,
    recordTip,
    isConnected: !!session,
    isLoading,
    isAdmin: !!currentAdminObj,
    adminRole: currentAdminObj ? currentAdminObj.role : null,
    isPermanentAdmin: isCurrentAdminPermanent,
    adminsList,
    addAdmin,
    removeAdmin,
    updateAdminRole,
    makeAdminPermanent,
    userProfile,
    updateUserProfile,
    isMaintenanceMode,
    setMaintenanceMode,
    networkAlert,
    broadcastAlert,
    membershipFee,
    membershipFeeXmd,
    membershipFeeXusdc,
    updateMembershipFee,
    boostPrice,
    updateBoostPrice,
    boostTabPrice,
    updateBoostTabPrice,
    boostPriceXusdc,
    updateBoostPriceXusdc,
    featuredHandles,
    boostStream,
    distributeXprRewards,
    promoCodes,
    createPromoCode,
    deletePromoCode,
    applyPromoCode,
    usePromoCode,
    favorites,
    toggleFavorite,
    isFavorite,
    liveActivities,
    resetLiveTicker,
    syncPlatformSettings
  };

  return <XprContext.Provider value={value}>{children}</XprContext.Provider>;
};

export const useXpr = () => {
  const context = useContext(XprContext);
  if (context === undefined) throw new Error('useXpr must be used within an XprProvider');
  return context;
};