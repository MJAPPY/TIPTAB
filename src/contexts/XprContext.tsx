"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';
import { Creator, CREATORS } from '@/data/creators';

interface Balances {
  xpr: string;
  tab: string;
}

interface XprContextType {
  session: LinkSession | null;
  actor: string | null;
  balances: Balances;
  isMember: boolean;
  setIsMember: (status: boolean) => void;
  login: () => Promise<LinkSession | null>;
  logout: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  userProfile: Creator | null;
  updateUserProfile: (profile: Creator) => void;
}

const XprContext = createContext<XprContextType | undefined>(undefined);

const PROTON_ENDPOINTS = [
  'https://api.protonnz.com',
  'https://proton.eosusa.io',
  'https://proton.cryptolions.io',
  'https://api.protonchain.com'
];

const APP_IDENTIFIER = 'tiptab';

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.0000', tab: '0' });
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Creator | null>(null);

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

      setBalances({
        xpr: xprData[0] ? parseFloat(xprData[0].split(' ')[0]).toFixed(4) : '0.0000',
        tab: tabData[0] ? Math.floor(parseFloat(tabData[0].split(' ')[0])).toString() : '0'
      });

      // Check local membership record
      const membershipKey = `tiptab_membership_${account}`;
      setIsMember(localStorage.getItem(membershipKey) === 'true');

      // Load Profile
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
          appName: 'TIP TAB',
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
          appName: 'TIP TAB',
          appLogo: 'https://explorer.xprnetwork.org/api/account/tiptab/avatar',
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
      setBalances({ xpr: '0.0000', tab: '0' });
      setIsMember(false);
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
    setIsMember,
    login,
    logout,
    refreshBalances,
    isConnected: !!session,
    isLoading,
    isAdmin: session?.auth.actor === 'tiptab',
    userProfile,
    updateUserProfile
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