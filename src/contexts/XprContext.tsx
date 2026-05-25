"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
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
}

const XprContext = createContext<XprContextType | undefined>(undefined);

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', xmt: '0.00000000', tipsSent: 0 });
  const [isMember, setIsMember] = useState(false);
  const [membershipDate, setMembershipDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Creator | null>(null);
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
      setBalances({ xpr: '0.0000', tab: '0', xmd: '0.000000', xusdc: '0.000000', metal: '0.00000000', loan: '0.0000', xmt: '0.00000000', tipsSent: 0 });
      setIsMember(false);
      setMembershipDate(null);
      setUserProfile(null);
      localStorage.removeItem("tiptab_user_profile");
    }
  };

  const refreshBalances = async () => { if (session) await fetchBalances(session.auth.actor.toString()); };

  const updateUserProfile = (profile: Creator) => {
    if (session?.auth.actor) {
      const actorName = session.auth.actor.toString();
      localStorage.setItem(`tiptab_profile_${actorName}`, JSON.stringify(profile));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(profile));
      setUserProfile(profile);
    }
  };

  const value = {
    session, actor: activeActor, balances, isMember, membershipDate, setIsMember, login, logout, refreshBalances, recordTip,
    isConnected: !!session, isLoading, isAdmin: !!adminHook.currentAdminObj, adminRole: adminHook.currentAdminObj ? adminHook.currentAdminObj.role : null,
    isPermanentAdmin: adminHook.isCurrentAdminPermanent, ...adminHook, ...platformHook, ...socialHook,
    userProfile, updateUserProfile, featuredHandles, boostStream, distributeXprRewards
  };

  return <XprContext.Provider value={value}>{children}</XprContext.Provider>;
};

export const useXpr = () => {
  const context = useContext(XprContext);
  if (context === undefined) throw new Error('useXpr must be used within an XprProvider');
  return context;
};