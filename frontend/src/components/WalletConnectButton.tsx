'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import WalletConnectModal from './WalletConnectModal';

export default function WalletConnectButton() {
  const { user, connected, disconnectWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (connected && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">
            {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30 rounded-lg text-sm font-medium transition-colors"
        >
          Disconnect
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
      >
        Connect Wallet
      </motion.button>

      <WalletConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}