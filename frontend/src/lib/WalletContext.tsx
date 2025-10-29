"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';

interface WalletContextType {
  user: any;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  useEffect(() => {
    setConnected(!!user?.loggedIn);
  }, [user]);

  const connectWallet = async () => {
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <WalletContext.Provider value={{
      user,
      connected,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};