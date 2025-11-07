'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';
import WalletConnectButton from '@/components/WalletConnectButton';

export const dynamic = 'force-dynamic';

interface NFT {
  id: string;
  badgeType: string;
  name: string;
  description: string;
  metadata: {
    name: string;
    description: string;
    image?: string;
  };
  earnedAt: string;
}

export default function NFTs() {
  const { user, connected } = useWallet();
  const { success, error: showError } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAchievements, setCheckingAchievements] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNFTs();
    }
  }, [user]);

  const fetchNFTs = async () => {
    try {
      const response = await fetch(`/api/community/nfts/user/${user?.addr}`, {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setNfts(result.data);
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      showError('Error', 'Failed to load NFT collection');
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    setCheckingAchievements(true);
    try {
      const response = await fetch('/api/community/achievements/check', {
        method: 'POST',
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        if (result.data.length > 0) {
          success('New Achievements!', `You earned ${result.data.length} new badge${result.data.length > 1 ? 's' : ''}!`);
          fetchNFTs(); // Refresh the collection
        } else {
          success('Checked Achievements', 'No new achievements unlocked yet. Keep using FlowFi!');
        }
      } else {
        showError('Error', 'Failed to check achievements');
      }
    } catch (err) {
      console.error('Error checking achievements:', err);
      showError('Error', 'Failed to check achievements');
    } finally {
      setCheckingAchievements(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    const icons: { [key: string]: string } = {
      workflow_master: '👑',
      staking_pro: '🏦',
      payment_warrior: '⚔️',
      community_contributor: '🤝',
      early_adopter: '🚀',
      monthly_streak: '🔥',
      dao_champion: '🏛️',
      template_forker: '🔀',
      high_value_workflow: '💎',
      beta_tester: '🧪'
    };
    return icons[badgeType] || '🏆';
  };

  const getBadgeColor = (badgeType: string) => {
    const colors: { [key: string]: string } = {
      workflow_master: 'from-yellow-400 to-orange-500',
      staking_pro: 'from-blue-400 to-blue-600',
      payment_warrior: 'from-red-400 to-red-600',
      community_contributor: 'from-green-400 to-green-600',
      early_adopter: 'from-purple-400 to-purple-600',
      monthly_streak: 'from-orange-400 to-red-500',
      dao_champion: 'from-indigo-400 to-indigo-600',
      template_forker: 'from-teal-400 to-teal-600',
      high_value_workflow: 'from-pink-400 to-pink-600',
      beta_tester: 'from-gray-400 to-gray-600'
    };
    return colors[badgeType] || 'from-gray-400 to-gray-600';
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Connect Your Wallet
          </h1>
          <p className="text-gray-300 mb-8 max-w-md">
            Connect your Flow wallet to view your NFT achievement badges.
          </p>
          <WalletConnectButton />
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <Loading size="lg" text="Loading NFT Collection..." className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              NFT Achievement Badges
            </h1>
            <p className="text-gray-300 mt-2">Your collection of FlowFi achievement NFTs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={checkAchievements}
            disabled={checkingAchievements}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            {checkingAchievements ? <Loading size="sm" /> : '🎯'}
            {checkingAchievements ? 'Checking...' : 'Check Achievements'}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { title: 'Total Badges', value: nfts.length, color: 'from-yellow-400 to-orange-500' },
            { title: 'Rare Badges', value: nfts.filter(nft => ['workflow_master', 'dao_champion', 'high_value_workflow'].includes(nft.badgeType)).length, color: 'from-purple-400 to-pink-500' },
            { title: 'This Month', value: nfts.filter(nft => new Date(nft.earnedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: 'from-green-400 to-blue-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}
              className={`bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
            >
              <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Your Achievement Collection
          </h2>

          {nfts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
              <p className="text-gray-400 mb-6">Start using FlowFi to earn your first achievement badges!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkAchievements}
                disabled={checkingAchievements}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300"
              >
                Check for Achievements
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,0,0.3)' }}
                  className={`bg-gradient-to-br ${getBadgeColor(nft.badgeType)} bg-opacity-10 border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all cursor-pointer group`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      {getBadgeIcon(nft.badgeType)}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{nft.metadata.name}</h3>
                    <p className="text-sm text-gray-300 mb-4">{nft.metadata.description}</p>
                    <div className="text-xs text-gray-400">
                      Earned {new Date(nft.earnedAt).toLocaleDateString()}
                    </div>
                    <div className="mt-4 px-3 py-1 bg-black/20 rounded-full text-xs font-medium">
                      #{nft.id}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Achievement Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8"
        >
          <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            How to Earn Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '👑', title: 'Workflow Master', desc: 'Create 100+ successful workflows', rarity: 'Legendary' },
              { icon: '🏦', title: 'Staking Pro', desc: 'Automate staking for 1+ years', rarity: 'Epic' },
              { icon: '⚔️', title: 'Payment Warrior', desc: 'Process 1000+ automated payments', rarity: 'Rare' },
              { icon: '🤝', title: 'Community Contributor', desc: 'Share 50+ workflow templates', rarity: 'Uncommon' },
              { icon: '🚀', title: 'Early Adopter', desc: 'Joined FlowFi during beta', rarity: 'Common' },
              { icon: '🔥', title: 'Monthly Streak', desc: 'Maintain active workflows for a month', rarity: 'Uncommon' },
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-lg"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      achievement.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                      achievement.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
                      achievement.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-400' :
                      achievement.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{achievement.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}