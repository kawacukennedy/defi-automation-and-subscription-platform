'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
    joinedAt: string;
  }>;
  proposals: Array<{
    proposalId: string;
    title: string;
    description: string;
    type: string;
    status: string;
    proposer: string;
    votes: Array<{
      voter: string;
      choice: 'yes' | 'no' | 'abstain';
      votingPower: number;
    }>;
    votingPower: {
      total: number;
      yes: number;
      no: number;
      abstain: number;
    };
    endTime: string;
    createdAt: string;
  }>;
  stats: {
    totalProposals: number;
    passedProposals: number;
    activeMembers: number;
  };
}

interface DAOStats {
  memberCount: number;
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  totalVotes: number;
  totalVotingPower: number;
}

export default function DAODetail() {
  const { daoId } = useParams();
  const { user } = useWallet();
  const { success, error: showError } = useToast();
  const [dao, setDao] = useState<DAO | null>(null);
  const [stats, setStats] = useState<DAOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    type: 'workflow_template'
  });

  useEffect(() => {
    if (daoId) {
      fetchDAO();
      fetchStats();
    }
  }, [daoId]);

  const fetchDAO = async () => {
    try {
      const response = await fetch(`/api/dao/${daoId}`);
      const result = await response.json();
      if (result.success) {
        setDao(result.data);
      } else {
        showError('DAO not found');
      }
    } catch (err) {
      console.error('Failed to fetch DAO:', err);
      showError('Failed to load DAO');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dao/${daoId}/stats`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch DAO stats:', err);
    }
  };

  const createProposal = async () => {
    if (!proposalForm.title.trim() || !proposalForm.description.trim()) {
      showError('Validation Error', 'Title and description are required');
      return;
    }

    try {
      const response = await fetch(`/api/dao/${daoId}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': user?.addr || ''
        },
        body: JSON.stringify(proposalForm)
      });

      const result = await response.json();
      if (result.success) {
        success('Proposal Created!', 'Your proposal has been submitted for voting.');
        setShowProposalModal(false);
        setProposalForm({ title: '', description: '', type: 'workflow_template' });
        fetchDAO();
      } else {
        showError('Creation Failed', result.error);
      }
    } catch (err) {
      console.error('Failed to create proposal:', err);
      showError('Creation Failed', 'Failed to create proposal. Please try again.');
    }
  };

  const voteOnProposal = async (proposalId: string, choice: 'yes' | 'no' | 'abstain') => {
    try {
      const response = await fetch(`/api/dao/${daoId}/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': user?.addr || ''
        },
        body: JSON.stringify({ choice })
      });

      const result = await response.json();
      if (result.success) {
        success('Vote Recorded!', 'Your vote has been recorded.');
        fetchDAO();
      } else {
        showError('Voting Failed', result.error);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
      showError('Voting Failed', 'Failed to record your vote. Please try again.');
    }
  };

  const isMember = dao?.members.some(member => member.address === user?.addr);
  const userVotingPower = dao?.members.find(member => member.address === user?.addr)?.votingPower || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!dao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">DAO Not Found</h1>
          <p className="text-gray-400">The requested DAO could not be found.</p>
        </div>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {dao.name}
              </h1>
              <p className="text-gray-300 mt-2">{dao.description}</p>
            </div>

            {isMember && (
              <motion.button
                onClick={() => setShowProposalModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                📝 Create Proposal
              </motion.button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{stats.memberCount}</div>
                <div className="text-sm text-gray-400">Members</div>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.totalProposals}</div>
                <div className="text-sm text-gray-400">Proposals</div>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">{stats.activeProposals}</div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.totalVotingPower}</div>
                <div className="text-sm text-gray-400">Total Power</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-4 border-b border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'proposals', label: 'Proposals', icon: '📋' },
              { id: 'members', label: 'Members', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-green-400 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Proposals */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Proposals</h3>
                <div className="space-y-4">
                  {dao.proposals.slice(0, 3).map((proposal) => (
                    <div key={proposal.proposalId} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div>
                        <h4 className="font-medium">{proposal.title}</h4>
                        <p className="text-sm text-gray-400">
                          Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          proposal.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          proposal.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {proposal.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {proposal.votes.length} votes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DAO Info */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">DAO Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Your Membership</h4>
                    {isMember ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-400">✓ Member</p>
                        <p className="text-sm">Voting Power: <span className="font-medium">{userVotingPower}</span></p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Not a member</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Governance</h4>
                    <div className="space-y-2 text-sm">
                      <p>Quorum: 50%</p>
                      <p>Threshold: 50%</p>
                      <p>Voting Period: 7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-6">
              {dao.proposals.map((proposal) => (
                <div key={proposal.proposalId} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                      <p className="text-gray-300 mb-3">{proposal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Type: {proposal.type.replace('_', ' ')}</span>
                        <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                        <span>Ends: {new Date(proposal.endTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                      proposal.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                      proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>

                  {/* Voting Progress */}
                  {proposal.status === 'active' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Voting Progress</span>
                        <span>{proposal.votingPower.total} / {dao.members.reduce((sum, m) => sum + m.votingPower, 0)} votes</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(proposal.votingPower.total / dao.members.reduce((sum, m) => sum + m.votingPower, 0)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Yes: {proposal.votingPower.yes}</span>
                        <span>No: {proposal.votingPower.no}</span>
                        <span>Abstain: {proposal.votingPower.abstain}</span>
                      </div>
                    </div>
                  )}

                  {/* Voting Actions */}
                  {proposal.status === 'active' && isMember && !proposal.votes.some(v => v.voter === user?.addr) && (
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => voteOnProposal(proposal.proposalId, 'yes')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
                      >
                        ✅ Yes ({userVotingPower})
                      </motion.button>
                      <motion.button
                        onClick={() => voteOnProposal(proposal.proposalId, 'no')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        ❌ No ({userVotingPower})
                      </motion.button>
                      <motion.button
                        onClick={() => voteOnProposal(proposal.proposalId, 'abstain')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-all"
                      >
                        🤷 Abstain ({userVotingPower})
                      </motion.button>
                    </div>
                  )}

                  {proposal.votes.some(v => v.voter === user?.addr) && (
                    <p className="text-sm text-green-400">
                      ✓ You voted: {proposal.votes.find(v => v.voter === user?.addr)?.choice}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">DAO Members</h3>
              <div className="space-y-4">
                {dao.members.map((member) => (
                  <div key={member.address} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.address.slice(0, 6)}...{member.address.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-400 capitalize">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{member.votingPower} VP</p>
                      <p className="text-sm text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Proposal Modal */}
      {showProposalModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowProposalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 max-w-lg w-full"
          >
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Create Proposal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Proposal Type</label>
                <select
                  value={proposalForm.type}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                >
                  <option value="workflow_template">Workflow Template</option>
                  <option value="parameter_change">Parameter Change</option>
                  <option value="fund_allocation">Fund Allocation</option>
                  <option value="feature_request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                  placeholder="Enter proposal title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors h-32 resize-none"
                  placeholder="Describe your proposal in detail"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={() => setShowProposalModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={createProposal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Create Proposal
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}