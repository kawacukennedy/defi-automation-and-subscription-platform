'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGitBranch, FiThumbsUp, FiShare2, FiStar, FiTrendingUp } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default function CommunityHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterToken, setFilterToken] = useState('all');
  const [filterFrequency, setFilterFrequency] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  // Enhanced mock data
  const templates = [
    {
      id: 1,
      name: 'Auto-Staking FLOW Rewards',
      creator: 'FlowMaster',
      creatorAvatar: 'FM',
      votes: 127,
      forks: 45,
      rating: 4.8,
      reviews: 23,
      action: 'stake',
      token: 'FLOW',
      frequency: 'daily',
      description: 'Automatically stake FLOW tokens and compound rewards daily',
      tags: ['staking', 'compound', 'FLOW'],
      trending: true,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Recurring USDC Payments',
      creator: 'DeFiWizard',
      creatorAvatar: 'DW',
      votes: 89,
      forks: 32,
      rating: 4.6,
      reviews: 18,
      action: 'subscription',
      token: 'USDC',
      frequency: 'monthly',
      description: 'Set up automated monthly payments in USDC for subscriptions',
      tags: ['payment', 'subscription', 'USDC'],
      trending: true,
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      name: 'Cross-DEX Arbitrage Bot',
      creator: 'ArbitrageKing',
      creatorAvatar: 'AK',
      votes: 203,
      forks: 67,
      rating: 4.9,
      reviews: 41,
      action: 'swap',
      token: 'MULTI',
      frequency: 'hourly',
      description: 'Monitor multiple DEXes and execute arbitrage opportunities',
      tags: ['arbitrage', 'swap', 'trading'],
      trending: true,
      createdAt: '2024-01-20'
    },
    {
      id: 4,
      name: 'NFT Minting Automation',
      creator: 'NFTCollector',
      creatorAvatar: 'NC',
      votes: 156,
      forks: 28,
      rating: 4.7,
      reviews: 33,
      action: 'mint_nft',
      token: 'FLOW',
      frequency: 'once',
      description: 'Automatically mint NFTs from whitelisted collections',
      tags: ['nft', 'minting', 'collection'],
      trending: false,
      createdAt: '2024-01-12'
    },
    {
      id: 5,
      name: 'DAO Voting Delegate',
      creator: 'GovernancePro',
      creatorAvatar: 'GP',
      votes: 94,
      forks: 19,
      rating: 4.5,
      reviews: 15,
      action: 'dao_vote',
      token: 'VOTE',
      frequency: 'weekly',
      description: 'Delegate voting power and vote on proposals automatically',
      tags: ['dao', 'governance', 'voting'],
      trending: false,
      createdAt: '2024-01-08'
    },
  ];

  const contributors = [
    { name: 'FlowMaster', avatar: 'FM', workflows: 23, reputation: 2450, badges: ['🏆', '⭐', '🚀'], rank: 1 },
    { name: 'ArbitrageKing', avatar: 'AK', workflows: 18, reputation: 2100, badges: ['💰', '⚡'], rank: 2 },
    { name: 'DeFiWizard', avatar: 'DW', workflows: 15, reputation: 1890, badges: ['🧙', '📊'], rank: 3 },
    { name: 'NFTCollector', avatar: 'NC', workflows: 12, reputation: 1650, badges: ['🎨'], rank: 4 },
    { name: 'GovernancePro', avatar: 'GP', workflows: 10, reputation: 1420, badges: ['🏛️'], rank: 5 },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = filterAction === 'all' || template.action === filterAction;
    const matchesToken = filterToken === 'all' || template.token === filterToken;
    const matchesFrequency = filterFrequency === 'all' || template.frequency === filterFrequency;

    return matchesSearch && matchesAction && matchesToken && matchesFrequency;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.votes - a.votes;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'forks':
        return b.forks - a.forks;
      default:
        return 0;
    }
  });

  const handleFork = (templateId: number) => {
    // Mock fork functionality
    alert(`Forking template ${templateId}...`);
  };

  const handleVote = (templateId: number) => {
    // Mock vote functionality
    alert(`Voting for template ${templateId}...`);
  };

  const handleShare = (template: any) => {
    if (navigator.share) {
      navigator.share({
        title: template.name,
        text: template.description,
        url: `https://flowfi.com/community/template/${template.id}`
      });
    } else {
      navigator.clipboard.writeText(`https://flowfi.com/community/template/${template.id}`);
      alert('Template link copied to clipboard!');
    }
  };

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
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Community Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover, fork, and share powerful workflow templates created by the FlowFi community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates, creators, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
              >
                <option value="all">All Actions</option>
                <option value="stake">Staking</option>
                <option value="swap">Swapping</option>
                <option value="subscription">Subscriptions</option>
                <option value="mint_nft">NFT Minting</option>
                <option value="dao_vote">DAO Voting</option>
              </select>
              <select
                value={filterToken}
                onChange={(e) => setFilterToken(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
              >
                <option value="all">All Tokens</option>
                <option value="FLOW">FLOW</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="MULTI">Multi-token</option>
              </select>
              <select
                value={filterFrequency}
                onChange={(e) => setFilterFrequency(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
              >
                <option value="all">All Frequencies</option>
                <option value="once">One-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="forks">Most Forked</option>
              </select>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Templates Grid */}
          <div className="xl:col-span-3">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-2xl font-semibold mb-6 flex items-center gap-2"
            >
              <FiTrendingUp className="w-6 h-6" />
              Workflow Templates ({filteredTemplates.length})
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl hover:border-green-400/50 transition-all duration-300 group"
                >
                  {template.trending && (
                    <div className="flex items-center gap-1 text-orange-400 text-sm mb-3">
                      <FiTrendingUp className="w-4 h-4" />
                      Trending
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-green-300 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {template.creatorAvatar}
                      </div>
                      <span className="text-sm text-gray-400">{template.creator}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(template.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-400 ml-1">({template.reviews})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiThumbsUp className="w-4 h-4" />
                        {template.votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiGitBranch className="w-4 h-4" />
                        {template.forks}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFork(template.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FiGitBranch className="w-4 h-4" />
                      Fork
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVote(template.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FiThumbsUp className="w-4 h-4" />
                      Vote
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare(template)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiShare2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl sticky top-8"
            >
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                🏆 Top Contributors
              </h3>
              <div className="space-y-4">
                {contributors.map((user, index) => (
                  <motion.div
                    key={user.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{user.rank}</span>
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.workflows} workflows</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-400">{user.reputation.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">rep</div>
                    </div>
                    <div className="flex gap-1">
                      {user.badges.map((badge, i) => (
                        <span key={i} className="text-sm" title="Achievement Badge">{badge}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}