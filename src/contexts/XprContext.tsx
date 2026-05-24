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

// IMMUTABLE ROOT ADMINS - Cannot be removed or downgraded via UI
const ROOT_ADMINS = ['tiptab'];

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
  favorites: string[];
  toggleFavorite: (handle: string) => void;
  isFavorite: (handle: string) => boolean;
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
const TOKENS = [
  { symbol: 'XPR', code: 'eosio.token', precision: 4 },
  { symbol: 'TAB', code: 'tokencreate', precision: 0 },
  { symbol: 'XMD', code: 'xmd.token', precision: 6 },
  { symbol: 'XUSDC', code: 'xtokens', precision: 6 },
  { symbol: 'METAL', code: 'token.metal', precision: 8 },
  { symbol: 'LOAN', code: 'loan.token', precision: 4 },
];

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', tipsSent: 0 });
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

  const [membershipFee, setMembershipFee] = useState("2500");
  const [membershipFeeXmd, setMembershipFeeXmd] = useState("2.50");
  const [membershipFeeXusdc, setMembershipFeeXusdc] = useState("2.50");
  const [boostPrice, setBoostPrice] = useState("1000");
  const [boostTabPrice, setBoostTabPrice] = useState("5000");
  const [boostPriceXusdc, setBoostPriceXusdc] = useState("1.00");

  const [networkAlert, setNetworkAlert] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tiptab_network_alert");
    return null;
  });

  const [adminsList, setAdminsList] = useState<AdminUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_admins_list");
      let list = saved ? JSON.parse(saved) : [];
      // Ensure Root Admins are ALWAYS in the list and correct
      ROOT_ADMINS.forEach(handle => {
        if (!list.find((a: AdminUser) => a.handle === handle)) {
          list.push({ id: `root_${handle}`, handle, role: "super", isPermanent: true });
        }
      });
      return list;
    }
    return ROOT_ADMINS.map(h => ({ id: `root_${h}`, handle: h, role: "super", isPermanent: true }));
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tiptab_maintenance") === "true";
    return false;
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

  const [featuredHandles, setFeaturedHandles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_featured_handles");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const activeActor = session ? session.auth.actor.toString() : null;
  const currentAdminObj = activeActor ? adminsList.find(a => a.handle === activeActor) : null;
  const isCurrentAdminPermanent = currentAdminObj?.isPermanent === true || (activeActor && ROOT_ADMINS.includes(activeActor));

  const syncPlatformSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 'global').single();
      if (data && !error) {
        setMembershipFee(data.membership_fee_xpr.toString());
        setMembershipFeeXmd(data.membership_fee_xmd.toString());
        setMembershipFeeXusdc(data.membership_fee_xusdc.toString());
        setBoostPrice(data.boost_price_xpr.toString());
        setBoostTabPrice(data.boost_price_tab.toString());
        setBoostPriceXusdc(data.boost_price_xusdc.toString());
      }
    } catch (err) { console.error("Settings sync error:", err); }
  }, []);

  useEffect(() => { syncPlatformSettings(); }, [syncPlatformSettings]);

  useEffect(() => {
    if (session?.auth.actor) {
      const saved = localStorage.getItem(`tiptab_favorites_${session.auth.actor.toString()}`);
      if (saved) setFavorites(JSON.parse(saved));
    } else { setFavorites([]); }
  }, [session]);

  const toggleFavorite = (handle: string) => {
    if (!session?.auth.actor) return;
    const cleanHandle = handle.toLowerCase().replace('@', '');
    const newFavorites = favorites.includes(cleanHandle) ? favorites.filter(h => h !== cleanHandle) : [...favorites, cleanHandle];
    setFavorites(newFavorites);
    localStorage.setItem(`tiptab_favorites_${session.auth.actor.toString()}`, JSON.stringify(newFavorites));
  };

  const isFavorite = (handle: string) => favorites.includes(handle.toLowerCase().replace('@', ''));

  const resetLiveTicker = () => {
    setLiveActivities(DEFAULT_ACTIVITIES);
    localStorage.setItem("tiptab_live_activities", JSON.stringify(DEFAULT_ACTIVITIES));
  };

  const setMaintenanceMode = (status: boolean) => {
    if (!currentAdminObj || currentAdminObj.role !== 'super') return;
    setIsMaintenanceMode(status);
    localStorage.setItem("tiptab_maintenance", status.toString());
  };

  const updateMembershipFee = async (fee: string, asset: 'XPR' | 'XMD' | 'XUSDC' = 'XPR') => {
    if (!currentAdminObj || currentAdminObj.role !== 'super') return;
    const updateData: any = { updated_at: new Date().toISOString() };
    if (asset === 'XPR') { setMembershipFee(fee); updateData.membership_fee_xpr = parseFloat(fee); }
    else if (asset === 'XMD') { setMembershipFeeXmd(fee); updateData.membership_fee_xmd = parseFloat(fee); }
    else if (asset === 'XUSDC') { setMembershipFee(fee); updateData.membership_fee_xusdc = parseFloat(fee); }
    await supabase.from('platform_settings').update(updateData).eq('id', 'global');
  };

  const updateBoostPrice = async (price: string) => {
    if (!currentAdminObj || currentAdminObj.role !== 'super') return;
    setBoostPrice(price);
    await supabase.from('platform_settings').update({ boost_price_xpr: parseFloat(price), updated_at: new Date().toISOString() }).eq('id', 'global');
  };

  const updateBoostTabPrice = async (price: string) => {
    if (!currentAdminObj || currentAdminObj.role !== 'super') return;
    setBoostTabPrice(price);
    await supabase.from('platform_settings').update({ boost_price_tab: parseFloat(price), updated_at: new Date().toISOString() }).eq('id', 'global');
  };

  const updateBoostPriceXusdc = async (price: string) => {
    if (!currentAdminObj || currentAdminObj.role !== 'super') return;
    setBoostPriceXusdc(price);
    await supabase.from('platform_settings').update({ boost_price_xusdc: parseFloat(price), updated_at: new Date().toISOString() }).eq('id', 'global');
  };

  const broadcastAlert = (message: string | null) => {
    if (!currentAdminObj) return;
    setNetworkAlert(message);
    if (message) localStorage.setItem("tiptab_network_alert", message);
    else localStorage.removeItem("tiptab_network_alert");
  };

  const addAdmin = (handle: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (!isCurrentAdminPermanent) return;
    const cleanHandle = handle.toLowerCase().trim().replace('@', '');
    if (!cleanHandle || adminsList.some(a => a.handle === cleanHandle)) return;
    const newAdmin: AdminUser = { id: "admin_" + Date.now(), handle: cleanHandle, role };
    const updated = [...adminsList, newAdmin];
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const removeAdmin = (id: string) => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target) return;
    if (ROOT_ADMINS.includes(target.handle)) return; // Root admins cannot be removed
    const updated = adminsList.filter(a => a.id !== id);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const updateAdminRole = (id: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target || ROOT_ADMINS.includes(target.handle)) return; // Root role is locked
    const updated = adminsList.map(a => a.id === id ? { ...a, role, isPermanent: role !== 'super' ? false : a.isPermanent } : a);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const makeAdminPermanent = (id: string, status: boolean) => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target || ROOT_ADMINS.includes(target.handle)) return;
    const updated = adminsList.map(a => a.id === id ? { ...a, isPermanent: status, role: status ? ('super' as const) : a.role } : a);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const createPromoCode = (code: string, type: 'free' | 'percent', value: number, maxUses: number) => {
    if (!currentAdminObj || (currentAdminObj.role !== 'super' && currentAdminObj.role !== 'treasurer')) return;
    const newCode: PromoCode = { id: "promo_" + Date.now(), code: code.toUpperCase().trim(), type, value: type === 'free' ? 100 : value, maxUses, uses: 0 };
    const updated = [...promoCodes, newCode];
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const deletePromoCode = (id: string) => {
    if (!currentAdminObj || (currentAdminObj.role !== 'super' && currentAdminObj.role !== 'treasurer')) return;
    const updated = promoCodes.filter(c => c.id !== id);
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const applyPromoCode = (code: string): PromoCode | null => {
    const cleanCode = code.toUpperCase().trim();
    const found = promoCodes.find(c => c.code === cleanCode);
    return (found && found.uses < found.maxUses) ? found : null;
  };

  const usePromoCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const updated = promoCodes.map(c => c.code === cleanCode ? { ...c, uses: c.uses + 1 } : c);
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const boostStream = async (handle: string, asset: 'XPR' | 'TAB' = 'XPR'): Promise<boolean> => {
    if (!session || !isMember) return false;
    try {
      const price = asset === 'XPR' ? boostPrice : boostTabPrice;
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
    if (!session || !currentAdminObj || (currentAdminObj.role !== 'super' && currentAdminObj.role !== 'treasurer')) return false;
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
    const actor = session.auth.actor.toString();
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
        if (data[0]) {
          const val = data[0].split(' ')[0];
          newBalances[token.symbol.toLowerCase()] = token.precision === 0 ? Math.floor(parseFloat(val)).toString() : parseFloat(val).toFixed(token.precision);
        } else {
          newBalances[token.symbol.toLowerCase()] = token.precision === 0 ? '0' : (0).toFixed(token.precision);
        }
      });
      const savedTips = parseInt(localStorage.getItem(`tiptab_tips_sent_${account}`) || "0");
      setBalances({ ...newBalances, tipsSent: savedTips });
      if (ROOT_ADMINS.includes(account)) {
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
          if (diffYears < 1) { setIsMember(true); setMembershipDate(savedDate); }
          else { setIsMember(false); setMembershipDate(null); localStorage.removeItem(membershipKey); }
        } else if (localStorage.getItem(membershipKey) === 'true') {
          const fakeDate = new Date().toISOString();
          localStorage.setItem(membershipDateKey, fakeDate);
          setMembershipDate(fakeDate);
          setIsMember(true);
        } else { setIsMember(false); setMembershipDate(null); }
      }
      const savedProfile = localStorage.getItem(`tiptab_profile_${account}`);
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      else {
        const seedCreator = CREATORS.find(c => c.handle === account);
        const newProfile: Creator = seedCreator ? { ...seedCreator } : {
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
      }
    } catch (error) { console.error('Balance sync error:', error); }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const { session: restoredSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS, restoreSession: true },
        transportOptions: { requestAccount: APP_IDENTIFIER },
        selectorOptions: { },
      });
      if (restoredSession) {
        setSession(restoredSession);
        await fetchBalances(restoredSession.auth.actor.toString());
      }
    } catch (error) { console.error('Session restoration error:', error); }
    finally { setIsLoading(false); }
  }, [fetchBalances]);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = async () => {
    try {
      const { session: newSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS },
        transportOptions: { requestAccount: APP_IDENTIFIER },
        selectorOptions: { },
      });
      if (newSession) {
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
      setSession(null);
      setBalances({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', tipsSent: 0 });
      setIsMember(false);
      setMembershipDate(null);
      setUserProfile(null);
      localStorage.removeItem("tiptab_user_profile");
    }
  };

  const refreshBalances = async () => { if (session) await fetchBalances(session.auth.actor.toString()); };

  const updateUserProfile = (profile: Creator) => {
    if (session?.auth.actor) {
      const actor = session.auth.actor.toString();
      localStorage.setItem(`tiptab_profile_${actor}`, JSON.stringify(profile));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(profile));
      setUserProfile(profile);
    }
  };

  const value = {
    session, actor: activeActor, balances, isMember, membershipDate, setIsMember, login, logout, refreshBalances, recordTip,
    isConnected: !!session, isLoading, isAdmin: !!currentAdminObj, adminRole: currentAdminObj ? currentAdminObj.role : null,
    isPermanentAdmin: isCurrentAdminPermanent, adminsList, addAdmin, removeAdmin, updateAdminRole, makeAdminPermanent,
    userProfile, updateUserProfile, isMaintenanceMode, setMaintenanceMode, networkAlert, broadcastAlert,
    membershipFee, membershipFeeXmd, membershipFeeXusdc, updateMembershipFee, boostPrice, updateBoostPrice,
    boostTabPrice, updateBoostTabPrice, boostPriceXusdc, updateBoostPriceXusdc, featuredHandles, boostStream, distributeXprRewards,
    promoCodes, createPromoCode, deletePromoCode, applyPromoCode, usePromoCode, favorites, toggleFavorite, isFavorite,
    liveActivities, resetLiveTicker, syncPlatformSettings
  };

  return <XprContext.Provider value={value}>{children}</XprContext.Provider>;
};

export const useXpr = () => {
  const context = useContext(XprContext);
  if (context === undefined) throw new Error('useXpr must be used within an XprProvider');
  return context;
};