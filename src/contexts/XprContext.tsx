"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';

interface Balances {
  xpr: string;
  tab: string;
}

interface XprContextType {
  session: LinkSession | null;
  actor: string | null;
  balances: Balances;
  login: () => Promise<LinkSession | null>;
  logout: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

const XprContext = createContext<XprContextType | undefined>(undefined);

const ENDPOINT = 'https://proton.greymass.com';
const APP_IDENTIFIER = 'tabxpr'; // Updated to confirmed platform account

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.00', tab: '0.00' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = useCallback(async (account: string) => {
    try {
      const xprRes = await fetch(`${ENDPOINT}/v1/chain/get_currency_balance`, {
        method: 'POST',
        body: JSON.stringify({
          code: 'eosio.token',
          account: account,
          symbol: 'XPR'
        })
      });
      const xprData = await xprRes.json();
      
      const tabRes = await fetch(`${ENDPOINT}/v1/chain/get_currency_balance`, {
        method: 'POST',
        body: JSON.stringify({
          code: 'tokencreate',
          account: account,
          symbol: 'TAB'
        })
      });
      const tabData = await tabRes.json();

      setBalances({
        xpr: xprData[0] ? xprData[0].split(' ')[0] : '0.00',
        tab: tabData[0] ? tabData[0].split(' ')[0] : '0.00'
      });
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const { session: restoredSession } = await ProtonWebSDK({
        linkOptions: {
          endpoints: [ENDPOINT],
          restoreSession: true,
        },
        transportOptions: {
          requestAccount: APP_IDENTIFIER,
        },
        selectorOptions: {
          appName: 'TAB Network',
          appLogo: 'https://explorer.xprnetwork.org/api/account/tabxpr/avatar',
        },
      });

      if (restoredSession) {
        setSession(restoredSession);
        await fetchBalances(restoredSession.auth.actor);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
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
        linkOptions: {
          endpoints: [ENDPOINT],
        },
        transportOptions: {
          requestAccount: APP_IDENTIFIER,
        },
        selectorOptions: {
          appName: 'TAB Network',
          appLogo: 'https://explorer.xprnetwork.org/api/account/tabxpr/avatar',
        },
      });

      if (newSession) {
        setSession(newSession);
        await fetchBalances(newSession.auth.actor);
        return newSession;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (session) {
      await session.remove();
      setSession(null);
      setBalances({ xpr: '0.00', tab: '0.00' });
    }
  };

  const refreshBalances = async () => {
    if (session) {
      await fetchBalances(session.auth.actor);
    }
  };

  const value = {
    session,
    actor: session ? session.auth.actor : null,
    balances,
    login,
    logout,
    refreshBalances,
    isConnected: !!session,
    isLoading,
    isAdmin: session?.auth.actor === 'tabxpr', // tabxpr is the platform admin
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