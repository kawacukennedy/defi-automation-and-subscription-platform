'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';

interface DAO {
  daoId: string;
  name: string;
  description: string;
  members: Array<{
    address: string;
    votingPower: number;
    role: string;
  }>;
  proposals: Array<{
    proposalId: string;
    title: string;
    status: string;
    endTime: string;
  }>;
  stats: {
    totalProposals: number;
    passedProposals: number;
    activeMembers: number;
  };
}

export default function DAO() {
  const { user } = useWallet();
  const { success, error: showError } = useToast();
  const [daos, setDaos] = useState<DAO[]>([]);
  const [userDaos, setUserDaos] = useState<DAO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchDAOs();
    fetchUserDAOs();
  }, []);

  const fetchDAOs = async () => {
    try {
      // For now, return mock data since we don't have public DAOs yet
      setDaos([]);
    } catch (err) {
      console.error('Failed to fetch DAOs:', err);
    }
  };

  const fetchUserDAOs = async () => {
    try {
      const response = await fetch('/api/dao/user/daos', {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setUserDaos(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch user DAOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDAO = async () => {
    if (!createForm.name.trim()) {
      showError('Validation Error', 'DAO name is required');
      return;
    }

    try {
      const response = await fetch('/api/dao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': user?.addr || ''
        },
        body: JSON.stringify(createForm)
      });

      const result = await response.json();
      if (result.success) {
        success('DAO Created!', 'Your DAO has been created successfully.');
        setShowCreateModal(false);
        setCreateForm({ name: '', description: '' });
        fetchUserDAOs();
      } else {
        showError('Creation Failed', result.error);
      }
    } catch (err) {
      console.error('Failed to create DAO:', err);
      showError('Creation Failed', 'Failed to create DAO. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            DAO Governance
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Create and participate in decentralized autonomous organizations.
            Vote on proposals, manage shared workflows, and govern the platform together.
          </p>
        </motion.div>

        {/* Create DAO Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            🏛️ Create New DAO
          </motion.button>
        </motion.div>

        {/* User's DAOs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Your DAOs
          </h2>

          {userDaos.length === 0 ? (
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-2">No DAOs Yet</h3>
              <p className="text-gray-400 mb-4">
                Create your first DAO to start governing workflows and making decisions together.
              </p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Create Your First DAO
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDaos.map((dao) => (
                <motion.div
                  key={dao.daoId}
                  whileHover={{ scale: 1.02 }}
                  className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 cursor-pointer hover:border-green-400/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{dao.name}</h3>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Active
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {dao.description || 'A decentralized autonomous organization for collaborative decision making.'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Members:</span>
                      <span className="ml-2 font-medium">{dao.members.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Proposals:</span>
                      <span className="ml-2 font-medium">{dao.stats.totalProposals}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        View Details
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                      >
                        ⚙️
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Public DAOs */}
        {daos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Public DAOs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {daos.map((dao) => (
                <motion.div
                  key={dao.daoId}
                  whileHover={{ scale: 1.02 }}
                  className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{dao.name}</h3>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      Public
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {dao.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Members:</span>
                      <span className="ml-2 font-medium">{dao.members.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Proposals:</span>
                      <span className="ml-2 font-medium">{dao.stats.totalProposals}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Join DAO
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Create DAO Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Create New DAO
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">DAO Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                  placeholder="Enter DAO name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Describe your DAO's purpose"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={() => setShowCreateModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={createDAO}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Create DAO
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}