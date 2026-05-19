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

const PROTON_ENDPOINTS = [
  'https://api.protonnz.com',
  'https://proton.eosusa.io',
  'https://proton.cryptolions.io',
  'https://api.protonchain.com'
];

const APP_IDENTIFIER = 'tiptab';

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.0000', tab: '0.0000' });
  const [isLoading, setIsLoading] = useState(true);

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
        tab: tabData[0] ? parseFloat(tabData[0].split(' ')[0]).toFixed(4) : '0.0000'
      });
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
      setBalances({ xpr: '0.0000', tab: '0.0000' });
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
    isAdmin: session?.auth.actor === 'tiptab',
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