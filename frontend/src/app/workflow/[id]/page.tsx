'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';
import WalletConnectButton from '@/components/WalletConnectButton';

export const dynamic = 'force-dynamic';

export default function WorkflowDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, connected } = useWallet();
  const { success, error: showError } = useToast();
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (params.id && user) {
      fetchWorkflowDetail(params.id as string);
    }
  }, [params.id, user]);

  const executeWorkflow = async () => {
    if (!workflow) return;

    setExecuting(true);
    try {
      const response = await fetch(`/api/workflows/${workflow.workflowId}/execute`, {
        method: 'POST',
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        success('Execution Started', 'Workflow execution has been initiated');
        // Refresh workflow data
        fetchWorkflowDetail(params.id as string);
      } else {
        showError('Execution Failed', result.error || 'Failed to execute workflow');
      }
    } catch (err) {
      console.error('Error executing workflow:', err);
      showError('Execution Failed', 'Failed to execute workflow');
    } finally {
      setExecuting(false);
    }
  };

  const fetchWorkflowDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setWorkflow(result.data);
      } else {
        showError('Error', 'Failed to load workflow details');
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
      showError('Error', 'Failed to load workflow details');
    } finally {
      setLoading(false);
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
            Connect your Flow wallet to view and manage your workflow.
          </p>
          <WalletConnectButton />
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <Loading size="lg" text="Loading Workflow..." className="text-white" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workflow Not Found</h1>
          <p className="text-gray-300 mt-2">Workflow ID: {params.id}</p>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Back to Dashboard</Link>
        </div>
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
              {workflow.name || `Workflow ${workflow.workflowId?.slice(-8)}`}
            </h1>
            <p className="text-gray-300 mt-2">Workflow ID: {workflow.workflowId}</p>
          </div>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Workflow Status</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  workflow.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  workflow.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  workflow.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {workflow.status?.charAt(0).toUpperCase() + workflow.status?.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{workflow.executionCount || 0}</p>
                  <p className="text-sm text-gray-400">Total Executions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{workflow.successCount || 0}</p>
                  <p className="text-sm text-gray-400">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{workflow.failureCount || 0}</p>
                  <p className="text-sm text-gray-400">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {workflow.executionCount > 0 ? Math.round((workflow.successCount / workflow.executionCount) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-400">Success Rate</p>
                </div>
              </div>
            </motion.div>

            {/* Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Action</p>
                  <p className="font-medium capitalize">{workflow.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Token</p>
                  <p className="font-medium">{workflow.token}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="font-medium">{workflow.amount} {workflow.token}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Frequency</p>
                  <p className="font-medium capitalize">{workflow.frequency || 'Once'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Trigger</p>
                  <p className="font-medium capitalize">{workflow.trigger || 'Manual'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="font-medium">{workflow.createdAt ? new Date(workflow.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </motion.div>

            {/* Forte Actions Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Forte Actions Integration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium">Automated Execution</h3>
                    <p className="text-sm text-gray-400">Workflow runs automatically based on triggers</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {workflow.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium">Gas Optimization</h3>
                    <p className="text-sm text-gray-400">AI-powered gas fee optimization</p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    Enabled
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium">Error Recovery</h3>
                    <p className="text-sm text-gray-400">Automatic retry on transaction failures</p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    3 Retries
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Execution Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Execution Controls</h2>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={executeWorkflow}
                  disabled={executing || workflow.status !== 'active'}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {executing ? <Loading size="sm" /> : '🚀'}
                  {executing ? 'Executing...' : 'Execute Now'}
                </motion.button>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Next Scheduled Run</p>
                  <p className="font-medium">
                    {workflow.nextExecution ? new Date(workflow.nextExecution).toLocaleString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Monitoring */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Monitoring</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Execution</span>
                  <span className="text-sm font-medium">
                    {workflow.lastExecution ? new Date(workflow.lastExecution).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gas Used (avg)</span>
                  <span className="text-sm font-medium">~50,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium text-green-400">99.8%</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Executions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Recent Executions</h2>
              <div className="space-y-3">
                {/* Mock execution history - in real app, fetch from API */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Execution #1</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Success</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Execution #2</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Success</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}