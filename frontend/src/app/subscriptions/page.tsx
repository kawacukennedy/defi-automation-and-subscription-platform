'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';
import WalletConnectButton from '@/components/WalletConnectButton';

export const dynamic = 'force-dynamic';

interface Subscription {
  subscriptionId: string;
  recipient: string;
  token: string;
  amount: number;
  interval: number;
  status: string;
  nextPayment: string;
  lastPayment?: string;
  totalPayments: number;
  stats: {
    successfulPayments: number;
    failedPayments: number;
    totalVolume: number;
  };
  createdAt: string;
}

export default function Subscriptions() {
  const { user, connected } = useWallet();
  const { success, error: showError } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setSubscriptions(result.data);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      showError('Error', 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: 'pause' | 'resume' | 'cancel') => {
    setActionLoading(subscriptionId);
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/${action}`, {
        method: 'POST',
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        success('Success', `Subscription ${action}d successfully`);
        fetchSubscriptions(); // Refresh the list
      } else {
        showError('Error', result.error || `Failed to ${action} subscription`);
      }
    } catch (err) {
      console.error(`Error ${action}ing subscription:`, err);
      showError('Error', `Failed to ${action} subscription`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatInterval = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${seconds / 60} minutes`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      case 'expired': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
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
            Connect your Flow wallet to manage your recurring payment subscriptions.
          </p>
          <WalletConnectButton />
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <Loading size="lg" text="Loading Subscriptions..." className="text-white" />
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
              Subscriptions
            </h1>
            <p className="text-gray-300 mt-2">Manage your recurring payment subscriptions</p>
          </div>
          <Link href="/create-workflow?action=subscription">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300"
            >
              Create Subscription
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { title: 'Active Subscriptions', value: subscriptions.filter(s => s.status === 'active').length, color: 'from-green-400 to-green-600' },
            { title: 'Total Volume', value: `$${subscriptions.reduce((sum, s) => sum + s.stats.totalVolume, 0).toFixed(2)}`, color: 'from-blue-400 to-blue-600' },
            { title: 'Success Rate', value: subscriptions.length > 0 ? `${Math.round(subscriptions.reduce((sum, s) => sum + (s.stats.successfulPayments / Math.max(s.stats.successfulPayments + s.stats.failedPayments, 1)) * 100, 0) / subscriptions.length)}%` : '0%', color: 'from-purple-400 to-purple-600' },
            { title: 'Next Payment', value: subscriptions.filter(s => s.status === 'active').length > 0 ? 'Today' : 'None', color: 'from-yellow-400 to-yellow-600' },
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

        {/* Subscriptions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">Your Subscriptions</h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">No subscriptions yet</p>
              <Link href="/create-workflow?action=subscription">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                >
                  Create Your First Subscription
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.subscriptionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {subscription.amount} {subscription.token} to {subscription.recipient.slice(0, 6)}...{subscription.recipient.slice(-4)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Every {formatInterval(subscription.interval)} • Created {new Date(subscription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Payments</p>
                      <p className="font-semibold">{subscription.totalPayments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Successful</p>
                      <p className="font-semibold text-green-400">{subscription.stats.successfulPayments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Failed</p>
                      <p className="font-semibold text-red-400">{subscription.stats.failedPayments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Volume</p>
                      <p className="font-semibold">${subscription.stats.totalVolume.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Next Payment</p>
                      <p className="font-medium">
                        {subscription.status === 'active' ? new Date(subscription.nextPayment).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {subscription.status === 'active' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubscriptionAction(subscription.subscriptionId, 'pause')}
                          disabled={actionLoading === subscription.subscriptionId}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-400/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {actionLoading === subscription.subscriptionId ? <Loading size="sm" /> : 'Pause'}
                        </motion.button>
                      )}
                      {subscription.status === 'paused' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubscriptionAction(subscription.subscriptionId, 'resume')}
                          disabled={actionLoading === subscription.subscriptionId}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {actionLoading === subscription.subscriptionId ? <Loading size="sm" /> : 'Resume'}
                        </motion.button>
                      )}
                      {subscription.status !== 'cancelled' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubscriptionAction(subscription.subscriptionId, 'cancel')}
                          disabled={actionLoading === subscription.subscriptionId}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {actionLoading === subscription.subscriptionId ? <Loading size="sm" /> : 'Cancel'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}