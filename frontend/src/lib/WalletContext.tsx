"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';

interface WalletContextType {
  user: any;
  connected: boolean;
  walletType: string | null;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchWallet: (walletType: string) => Promise<void>;
  supportedWallets: string[];
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
  const [walletType, setWalletType] = useState<string | null>(null);

  // Supported wallet types
  const supportedWallets = ['dapper', 'blocto', 'lilico', 'ledger', 'metamask'];

  useEffect(() => {
    // Configure FCL with multiple wallet support
    fcl.config({
      'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://access-testnet.onflow.org',
      'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY || 'https://fcl-discovery.onflow.org/testnet/authn',
      'app.detail.title': 'FlowFi',
      'app.detail.icon': 'https://flowfi.vercel.app/favicon.ico',
      'app.detail.description': 'DeFi Automation & Subscription Platform',
      // Wallet discovery configuration
      'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/api/testnet/authn',
      'discovery.authn.include': [
        '0x82ec283f88a62e65', // Dapper Wallet
        '0x9d2e44203cb13051', // Blocto
        '0x01ab36aaf654a13a', // Lilico
        '0x9d2e44203cb13051', // Ledger (via Blocto)
      ],
    });

    fcl.currentUser().subscribe(setUser);
  }, []);

  useEffect(() => {
    setConnected(!!user?.loggedIn);
    if (user?.loggedIn) {
      // Determine wallet type from user data
      const addr = user?.addr;
      if (addr) {
        // This is a simplified wallet type detection
        // In production, you'd check the wallet discovery service
        setWalletType('flow'); // Default to Flow wallet
      }
    } else {
      setWalletType(null);
    }
  }, [user]);

  const connectWallet = async (walletTypeParam?: string) => {
    try {
      if (walletTypeParam) {
        // Configure FCL for specific wallet
        const walletConfig = getWalletConfig(walletTypeParam);
        if (walletConfig) {
          fcl.config(walletConfig);
        }
      }

      await fcl.authenticate();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await fcl.unauthenticate();
      setWalletType(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const switchWallet = async (newWalletType: string) => {
    try {
      // Disconnect current wallet
      await disconnectWallet();

      // Connect to new wallet
      await connectWallet(newWalletType);
      setWalletType(newWalletType);
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      throw error;
    }
  };

  const getWalletConfig = (walletType: string) => {
    const configs: { [key: string]: any } = {
      dapper: {
        'discovery.wallet.method': 'IFRAME/RPC',
        'discovery.wallet': 'https://dapperwallet.com/authn',
      },
      blocto: {
        'discovery.wallet.method': 'IFRAME/RPC',
        'discovery.wallet': 'https://wallet-v2.blocto.app/authn',
      },
      lilico: {
        'discovery.wallet.method': 'IFRAME/RPC',
        'discovery.wallet': 'https://wallet.lilico.app/authn',
      },
      ledger: {
        'discovery.wallet.method': 'IFRAME/RPC',
        'discovery.wallet': 'https://hw.blocto.app/authn', // Ledger via Blocto
      },
      metamask: {
        // MetaMask integration would require additional setup
        'discovery.wallet.method': 'POP/RPC',
        'discovery.wallet': 'https://metamask.app.link/authn',
      },
    };

    return configs[walletType] || null;
  };

  return (
    <WalletContext.Provider value={{
      user,
      connected,
      walletType,
      connectWallet,
      disconnectWallet,
      switchWallet,
      supportedWallets
    }}>
      {children}
    </WalletContext.Provider>
  );
};