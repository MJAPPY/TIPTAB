import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ProtonWebSDK, { LinkSession } from '@proton/web-sdk';

interface XprContextType {
  session: LinkSession | null;
  actor: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

const XprContext = createContext<XprContextType | undefined>(undefined);

export const XprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LinkSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const appIdentifier = 'tiptab';

  const restoreSession = useCallback(async () => {
    try {
      const { session: restoredSession } = await ProtonWebSDK({
        linkOptions: {
          endpoints: ['https://proton.greymass.com'],
          restoreSession: true,
        },
        transportOptions: {
          requestAccount: appIdentifier,
        },
        selectorOptions: {
          appName: 'TipTab',
          appLogo: 'https://tiptab.xyz/logo.png', // Fallback or placeholder
        },
      });

      if (restoredSession) {
        setSession(restoredSession);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async () => {
    try {
      const { session: newSession } = await ProtonWebSDK({
        linkOptions: {
          endpoints: ['https://proton.greymass.com'],
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
    }
  };

  const value = {
    session,
    actor: session ? session.auth.actor : null,
    login,
    logout,
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