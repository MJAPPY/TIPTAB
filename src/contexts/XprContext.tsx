"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
import { CREATORS, Creator } from '@/data/creators';

export interface PromoCode {
  id: string;
  code: string;
  type: 'free' | 'percent';
  value: number; // e.g., 50 for 50% off
  maxUses: number;
  uses: number;
}

export interface AdminUser {
  id: string;
  handle: string;
  role: 'super' | 'moderator' | 'treasurer';
}

interface Balances {
  xpr: string;
  tab: string;
  tipsSent: number;
}

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
  adminsList: AdminUser[];
  addAdmin: (handle: string, role: 'super' | 'moderator' | 'treasurer') => void;
  removeAdmin: (id: string) => void;
  updateAdminRole: (id: string, role: 'super' | 'moderator' | 'treasurer') => void;
  userProfile: Creator | null;
  updateUserProfile: (profile: Creator) => void;
  isMaintenanceMode: boolean;
  setMaintenanceMode: (status: boolean) => void;
  networkAlert: string | null;
  broadcastAlert: (message: string | null) => void;
  membershipFee: string;
  updateMembershipFee: (fee: string) => void;
  boostPrice: string;
  updateBoostPrice: (price: string) => void;
  featuredHandles: string[];
  boostStream: (handle: string) => Promise<boolean>;
  distributeXprRewards: (winners: { account: string; amount: string }[]) => Promise<boolean>;
  // Promo code system
  promoCodes: PromoCode[];
  createPromoCode: (code: string, type: 'free' | 'percent', value: number, maxUses: number) => void;
  deletePromoCode: (id: string) => void;
  applyPromoCode: (code: string) => PromoCode | null;
  usePromoCode: (code: string) => void;
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

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.0000', tab: '0', tipsSent: 0 });
  const [isMember, setIsMember] = useState(false);
  const [membershipDate, setMembershipDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Creator | null>(null);
  
  const [networkAlert, setNetworkAlert] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_network_alert");
    }
    return null;
  });
  
  const [membershipFee, setMembershipFee] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_membership_fee") || "2500";
    }
    return "2500";
  });

  const [boostPrice, setBoostPrice] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_boost_price") || "500";
    }
    return "500";
  });

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

  // Persisted admin list
  const [adminsList, setAdminsList] = useState<AdminUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_admins_list");
      return saved ? JSON.parse(saved) : [
        { id: "root", handle: "tiptab", role: "super" }
      ];
    }
    return [{ id: "root", handle: "tiptab", role: "super" }];
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

  const setMaintenanceMode = (status: boolean) => {
    setIsMaintenanceMode(status);
    localStorage.setItem("tiptab_maintenance", status.toString());
  };

  const updateMembershipFee = (fee: string) => {
    setMembershipFee(fee);
    localStorage.setItem("tiptab_membership_fee", fee);
  };

  const updateBoostPrice = (price: string) => {
    setBoostPrice(price);
    localStorage.setItem("tiptab_boost_price", price);
  };

  const broadcastAlert = (message: string | null) => {
    setNetworkAlert(message);
    if (message) {
      localStorage.setItem("tiptab_network_alert", message);
    } else {
      localStorage.removeItem("tiptab_network_alert");
    }
  };

  // Admin Management Functions - strictly restricted to tiptab
  const addAdmin = (handle: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (activeActor !== 'tiptab') return; // Absolutely restricted to root creator
    const cleanHandle = handle.toLowerCase().trim().replace('@', '');
    if (!cleanHandle) return;
    
    // Check if already an admin
    if (adminsList.some(a => a.handle === cleanHandle)) return;

    const newAdmin: AdminUser = {
      id: "admin_" + Date.now(),
      handle: cleanHandle,
      role
    };

    const updated = [...adminsList, newAdmin];
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const removeAdmin = (id: string) => {
    if (activeActor !== 'tiptab') return; // Absolutely restricted to root creator
    const target = adminsList.find(a => a.id === id);
    if (target?.handle === 'tiptab') return; // Can never remove tiptab

    const updated = adminsList.filter(a => a.id !== id);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const updateAdminRole = (id: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (activeActor !== 'tiptab') return; // Absolutely restricted to root creator
    const target = adminsList.find(a => a.id === id);
    if (target?.handle === 'tiptab') return; // tiptab Super Admin role is permanent

    const updated = adminsList.map(a => a.id === id ? { ...a, role } : a);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const [promoCodesState, setPromoCodesState] = useState<PromoCode[]>([]);

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
    if (found && found.uses < found.maxUses) {
      return found;
    }
    return null;
  };

  const usePromoCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const updated = promoCodes.map(c => {
      if (c.code === cleanCode) {
        return { ...c, uses: c.uses + 1 };
      }
      return c;
    });
    setPromoCodes(updated);
    localStorage.setItem("tiptab_promo_codes", JSON.stringify(updated));
  };

  const boostStream = async (handle: string): Promise<boolean> => {
    if (!session || !isMember) return false;
    
    try {
      const formattedAmount = `${parseFloat(boostPrice).toFixed(4)} XPR`;
      const action = {
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: session.auth.actor,
          permission: session.auth.permission,
        }],
        data: {
          from: session.auth.actor,
          to: 'tiptab',
          quantity: formattedAmount,
          memo: `Boost Performance: ${handle}`,
        },
      };

      await session.transact({ actions: [action] }, { broadcast: true });
      
      const newFeatured = [...featuredHandles, handle.replace('@', '')];
      setFeaturedHandles(newFeatured);
      localStorage.setItem("tiptab_featured_handles", JSON.stringify(newFeatured));
      
      return true;
    } catch (e) {
      console.error("Boost failed", e);
      return false;
    }
  };

  const distributeXprRewards = async (winners: { account: string; amount: string }[]): Promise<boolean> => {
    if (!session) return false;
    
    // Allow any admin with super or treasurer access to distribute rewards
    const actorName = session.auth.actor;
    const currentAdmin = adminsList.find(a => a.handle === actorName);
    if (!currentAdmin || (currentAdmin.role !== 'super' && currentAdmin.role !== 'treasurer')) return false;
    
    try {
      const actions = winners.map(winner => ({
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: actorName,
          permission: session.auth.permission,
        }],
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
      const headers = { 'Content-Type': 'application/json' };
      const primaryEndpoint = PROTON_ENDPOINTS[0];
      
      const xprRes = await fetch(`${primaryEndpoint}/v1/chain/get_currency_balance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: 'eosio.token',
          account: account,
          symbol: 'XPR'
        })
      });
      
      const tabRes = await fetch(`${primaryEndpoint}/v1/chain/get_currency_balance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: 'tokencreate',
          account: account,
          symbol: 'TAB'
        })
      });

      const xprData = xprRes.ok ? await xprRes.json() : [];
      const tabData = tabRes.ok ? await tabRes.json() : [];

      const tipsSentKey = `tiptab_tips_sent_${account}`;
      const savedTips = parseInt(localStorage.getItem(tipsSentKey) || "0");

      setBalances({
        xpr: xprData[0] ? parseFloat(xprData[0].split(' ')[0]).toFixed(4) : '0.0000',
        tab: tabData[0] ? Math.floor(parseFloat(tabData[0].split(' ')[0])).toString() : '0',
        tipsSent: savedTips
      });

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
          coordinates: [0, 0],
          category: "Other",
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
        linkOptions: {
          endpoints: PROTON_ENDPOINTS,
          restoreSession: true,
        },
        transportOptions: {
          requestAccount: APP_IDENTIFIER,
          backoff: 1000,
        },
        selectorOptions: {
          appName: APP_NAME,
          appLogo: APP_LOGO,
          customStyleOptions: {
            modalBackgroundColor: '#0a0514',
            logoBackgroundColor: '#0a0514',
          }
        },
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

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async () => {
    try {
      const { session: newSession } = await ProtonWebSDK({
        linkOptions: { endpoints: PROTON_ENDPOINTS },
        transportOptions: { requestAccount: APP_IDENTIFIER },
        selectorOptions: {
          appName: APP_NAME,
          appLogo: APP_LOGO,
        },
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
      setBalances({ xpr: '0.0000', tab: '0', tipsSent: 0 });
      setIsMember(false);
      setMembershipDate(null);
      setUserProfile(null);
      localStorage.removeItem("tiptab_user_profile");
    }
  };

  const refreshBalances = async () => {
    if (session) {
      await fetchBalances(session.auth.actor);
    }
  };

  const updateUserProfile = (profile: Creator) => {
    if (session?.auth.actor) {
      localStorage.setItem(`tiptab_profile_${session.auth.actor}`, JSON.stringify(profile));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(profile));
      setUserProfile(profile);
    }
  };

  // Determine current active admin permissions
  const currentAdminObj = activeActor ? adminsList.find(a => a.handle === activeActor) : null;
  const isAdminActive = !!currentAdminObj;
  const activeAdminRole = currentAdminObj ? currentAdminObj.role : null;

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
    isAdmin: isAdminActive,
    adminRole: activeAdminRole,
    adminsList,
    addAdmin,
    removeAdmin,
    updateAdminRole,
    userProfile,
    updateUserProfile,
    isMaintenanceMode,
    setMaintenanceMode,
    networkAlert,
    broadcastAlert,
    membershipFee,
    updateMembershipFee,
    boostPrice,
    updateBoostPrice,
    featuredHandles,
    boostStream,
    distributeXprRewards,
    promoCodes,
    createPromoCode,
    deletePromoCode,
    applyPromoCode,
    usePromoCode
  };

  return <XprContext.Provider value={value}>{children}</XprContext.Provider>;
};

export const useXpr = () => {
  const context = useContext(XprContext);
  if (context === undefined) {
    throw new Error('useXpr must be used within an XprProvider');
  }
  return context;
};