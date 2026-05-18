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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

const XprContext = createContext<XprContextType | undefined>(undefined);

const ENDPOINT = 'https://proton.greymass.com';

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [balances, setBalances] = useState<Balances>({ xpr: '0.00', tab: '0.00' });
  const [isLoading, setIsLoading] = useState(true);

  const appIdentifier = 'tiptab';

  const fetchBalances = useCallback(async (account: string) => {
    try {
      // Fetch XPR balance
      const xprRes = await fetch(`${ENDPOINT}/v1/chain/get_currency_balance`, {
        method: 'POST',
        body: JSON.stringify({
          code: 'eosio.token',
          account: account,
          symbol: 'XPR'
        })
      });
      const xprData = await xprRes.json();
      
      // Fetch TAB balance
      const tabRes = await fetch(`${ENDPOINT}/v1/chain/get_currency_balance`, {
        method: 'POST',
        body: JSON.stringify({
          code: 'xtokens',
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
          requestAccount: appIdentifier,
        },
        selectorOptions: {
          appName: 'TipTab',
          appLogo: 'https://tiptab.xyz/logo.png',
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
          requestAccount: appIdentifier,
        },
        selectorOptions: {
          appName: 'TipTab',
          appLogo: 'https://tiptab.xyz/logo.png',
        },
      });

      if (newSession) {
        setSession(newSession);
        await fetchBalances(newSession.auth.actor);
      }
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