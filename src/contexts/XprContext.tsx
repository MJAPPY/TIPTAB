"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
import { Creator } from '@/data/creators';

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
  userProfile: Creator | null;
  updateUserProfile: (profile: Creator) => void;
  isMaintenanceMode: boolean;
  setMaintenanceMode: (status: boolean) => void;
  networkAlert: string | null;
  broadcastAlert: (message: string | null) => void;
  membershipFee: string;
  updateMembershipFee: (fee: string) => void;
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

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiptab_maintenance") === "true";
    }
    return false;
  });

  const setMaintenanceMode = (status: boolean) => {
    setIsMaintenanceMode(status);
    localStorage.setItem("tiptab_maintenance", status.toString());
  };

  const updateMembershipFee = (fee: string) => {
    setMembershipFee(fee);
    localStorage.setItem("tiptab_membership_fee", fee);
  };

  const broadcastAlert = (message: string | null) => {
    setNetworkAlert(message);
    if (message) {
      localStorage.setItem("tiptab_network_alert", message);
    } else {
      localStorage.removeItem("tiptab_network_alert");
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

      // Special case: Official Project account is always a member
      if (account === 'tiptab') {
        setIsMember(true);
        setMembershipDate(new Date(2024, 0, 1).toISOString());
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
        const newProfile: Creator = {
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

  const value = {
    session,
    actor: session ? session.auth.actor : null,
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
    isAdmin: session?.auth.actor === 'tiptab',
    userProfile,
    updateUserProfile,
    isMaintenanceMode,
    setMaintenanceMode,
    networkAlert,
    broadcastAlert,
    membershipFee,
    updateMembershipFee
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