'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { FiX } from 'react-icons/fi';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const wallets = [
  {
    id: 'dapper',
    name: 'Dapper Wallet',
    icon: '🦊',
    description: 'Popular Flow wallet with NFT support',
    comingSoon: false,
  },
  {
    id: 'blocto',
    name: 'Blocto',
    icon: '🔷',
    description: 'Multi-chain wallet with Flow support',
    comingSoon: false,
  },
  {
    id: 'lilico',
    name: 'Lilico',
    icon: '🌊',
    description: 'Flow-native wallet for seamless transactions',
    comingSoon: false,
  },
  {
    id: 'ledger',
    name: 'Ledger',
    icon: '🔐',
    description: 'Hardware wallet integration',
    comingSoon: true,
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'EVM bridging for cross-chain workflows',
    comingSoon: true,
  },
];

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectWallet } = useWallet();

  const handleWalletSelect = async (walletId: string) => {
    if (walletId === 'dapper' || walletId === 'blocto' || walletId === 'lilico') {
      try {
        await connectWallet();
        onClose();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      // For coming soon wallets, show a message
      alert(`${wallets.find(w => w.id === walletId)?.name} integration coming soon!`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-50"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Connect Wallet
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-6 text-sm">
                Choose your preferred wallet to connect to FlowFi and start automating your DeFi workflows.
              </p>

              {/* Wallet Options */}
              <div className="space-y-3">
                {wallets.map((wallet, index) => (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleWalletSelect(wallet.id)}
                    disabled={wallet.comingSoon}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left group ${
                      wallet.comingSoon
                        ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-60'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl ${wallet.comingSoon ? 'grayscale' : ''}`}>
                        {wallet.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">
                            {wallet.name}
                          </h3>
                          {wallet.comingSoon && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {wallet.description}
                        </p>
                      </div>
                      {!wallet.comingSoon && (
                        <motion.div
                          className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ x: 5 }}
                        >
                          →
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}