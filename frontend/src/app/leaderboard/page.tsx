'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface LeaderboardUser {
  address: string;
  username?: string;
  reputationScore: number;
  totalWorkflows: number;
  totalExecutions: number;
  achievements: number;
  rank: number;
  badges: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contributors' | 'achievements'>('contributors');

  useEffect(() => {
    fetchLeaderboard();
    fetchAchievements();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Mock data for now
      const mockData: LeaderboardUser[] = [
        {
          address: '0x1234...abcd',
          username: 'DeFiMaster',
          reputationScore: 1250,
          totalWorkflows: 45,
          totalExecutions: 1200,
          achievements: 8,
          rank: 1,
          badges: ['Workflow Champion', 'Execution Master', 'Community Builder']
        },
        {
          address: '0x5678...efgh',
          username: 'FlowAutomator',
          reputationScore: 1100,
          totalWorkflows: 38,
          totalExecutions: 950,
          achievements: 6,
          rank: 2,
          badges: ['Staking Pro', 'Template Creator']
        },
        {
          address: '0x9abc...ijkl',
          username: 'StakingPro',
          reputationScore: 980,
          totalWorkflows: 32,
          totalExecutions: 800,
          achievements: 5,
          rank: 3,
          badges: ['Early Adopter', 'Fork Master']
        },
        {
          address: '0xdef0...mnop',
          username: 'NFTCollector',
          reputationScore: 850,
          totalWorkflows: 28,
          totalExecutions: 650,
          achievements: 4,
          rank: 4,
          badges: ['NFT Minter']
        },
        {
          address: '0xqrst...uvwx',
          username: 'DAOLeader',
          reputationScore: 720,
          totalWorkflows: 22,
          totalExecutions: 500,
          achievements: 3,
          rank: 5,
          badges: ['Governance Guru']
        }
      ];
      setLeaderboard(mockData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    // Mock achievements
    const mockAchievements: Achievement[] = [
      { id: '1', name: 'First Workflow', description: 'Create your first workflow', icon: '🚀', rarity: 'common' },
      { id: '2', name: 'Execution Master', description: '100 successful executions', icon: '⚡', rarity: 'rare' },
      { id: '3', name: 'Workflow Champion', description: 'Create 50+ workflows', icon: '🏆', rarity: 'epic' },
      { id: '4', name: 'Community Builder', description: 'Help 10+ users', icon: '🤝', rarity: 'legendary' },
    ];
    setAchievements(mockAchievements);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full"
        />
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
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
        >
          🏆 Leaderboard & Achievements
        </motion.h1>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-black/20 backdrop-blur-md border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('contributors')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'contributors'
                  ? 'bg-green-500/20 text-green-400 border border-green-400/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Contributors
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'achievements'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Achievements
            </button>
          </div>
        </motion.div>

        {activeTab === 'contributors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Top Contributors
              </h2>
              <p className="text-gray-400 mt-1">Ranked by reputation score and community impact</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Reputation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Workflows
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Executions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Badges
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {leaderboard.map((user, index) => (
                    <motion.tr
                      key={user.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            user.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-600'
                          }`}>
                            {getRankIcon(user.rank)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {(user.username || user.address.slice(-2)).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {user.username || `User ${user.address.slice(-8)}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.address.slice(0, 6)}...{user.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-green-400">
                          {user.reputationScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.totalWorkflows}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.totalExecutions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.badges.slice(0, 2).map((badge, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-400/30">
                              {badge}
                            </span>
                          ))}
                          {user.badges.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                              +{user.badges.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}
                className={`bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} bg-opacity-10`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{achievement.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{achievement.name}</h3>
                  <p className="text-sm text-gray-300 mb-3">{achievement.description}</p>
                  <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                    achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* How Rankings Work */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            How Rankings & Achievements Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
              >
                📊
              </motion.div>
              <h3 className="font-semibold mb-2">Workflows Created</h3>
              <p className="text-sm text-gray-300">Earn reputation points for each workflow you create and share with the community</p>
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
              >
                ⚡
              </motion.div>
              <h3 className="font-semibold mb-2">Successful Executions</h3>
              <p className="text-sm text-gray-300">Gain points for each successful workflow execution and help others succeed</p>
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
              >
                🏆
              </motion.div>
              <h3 className="font-semibold mb-2">Achievements & Badges</h3>
              <p className="text-sm text-gray-300">Unlock NFT badges and achievements for milestones and community contributions</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}