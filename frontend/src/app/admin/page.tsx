'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';

export const dynamic = 'force-dynamic';

interface Workflow {
  workflowId: string;
  userAddress: string;
  action: string;
  status: string;
  lastExecution: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
}

interface SystemMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalUsers: number;
  totalExecutions: number;
  successRate: number;
  errorRate: number;
}

interface ErrorLog {
  id: string;
  message: string;
  count: number;
  lastOccurrence: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function AdminPanel() {
  const { user } = useWallet();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'workflows', label: 'Workflows', icon: '⚙️' },
    { id: 'errors', label: 'Errors', icon: '🚨' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'system', label: 'System', icon: '🔧' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch system metrics
      const metricsResponse = await fetch('/api/admin/analytics');
      const metricsData = await metricsResponse.json();
      if (metricsData.success) {
        setMetrics(metricsData.data);
      }

      // Fetch recent workflows
      const workflowsResponse = await fetch('/api/admin/workflows?limit=20');
      const workflowsData = await workflowsResponse.json();
      if (workflowsData.success) {
        setWorkflows(workflowsData.data);
      }

      // Fetch error logs
      const errorsResponse = await fetch('/api/admin/errors');
      const errorsData = await errorsResponse.json();
      if (errorsData.success) {
        setErrors(errorsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowAction = async (workflowId: string, action: 'retry' | 'cancel' | 'pause' | 'resume') => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/${action}`, {
        method: 'POST',
        headers: {
          'x-user-address': user?.addr || ''
        }
      });

      const result = await response.json();
      if (result.success) {
        success(`Workflow ${action} successful`);
        fetchDashboardData(); // Refresh data
      } else {
        showError(`Failed to ${action} workflow`);
      }
    } catch (err) {
      console.error(`Failed to ${action} workflow:`, err);
      showError(`Failed to ${action} workflow`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics && (
                <>
                  <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Workflows</p>
                        <p className="text-2xl font-bold">{metrics.totalWorkflows}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        ⚙️
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Workflows</p>
                        <p className="text-2xl font-bold text-green-400">{metrics.activeWorkflows}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        🟢
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Success Rate</p>
                        <p className="text-2xl font-bold text-blue-400">{metrics.successRate}%</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        📈
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-2xl font-bold text-purple-400">{metrics.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        👥
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Recent Workflow Activity
              </h3>
              <div className="space-y-3">
                {workflows.slice(0, 5).map((workflow) => (
                  <div key={workflow.workflowId} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        workflow.status === 'active' ? 'bg-green-400' :
                        workflow.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                      <div>
                        <p className="font-medium">{workflow.action} Workflow</p>
                        <p className="text-sm text-gray-400">
                          {workflow.userAddress.slice(0, 6)}...{workflow.userAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {workflow.executionCount} executions
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(workflow.lastExecution).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Summary */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Recent Errors
              </h3>
              <div className="space-y-3">
                {errors.slice(0, 3).map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div>
                      <p className="font-medium">{error.message}</p>
                      <p className="text-sm text-gray-400">
                        Last occurred: {new Date(error.lastOccurrence).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {error.severity}
                      </span>
                      <p className="text-sm text-gray-400 mt-1">{error.count} times</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'workflows':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Workflow Management
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3">Workflow ID</th>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Action</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Executions</th>
                      <th className="text-left p-3">Last Execution</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows.map((workflow) => (
                      <tr key={workflow.workflowId} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 font-mono text-sm">
                          {workflow.workflowId.slice(0, 8)}...
                        </td>
                        <td className="p-3 font-mono text-sm">
                          {workflow.userAddress.slice(0, 6)}...{workflow.userAddress.slice(-4)}
                        </td>
                        <td className="p-3 capitalize">{workflow.action}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            workflow.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            workflow.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            workflow.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {workflow.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <span className="text-green-400">{workflow.successCount}</span>
                            {' / '}
                            <span className="text-red-400">{workflow.failureCount}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {workflow.lastExecution ? new Date(workflow.lastExecution).toLocaleString() : 'Never'}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {workflow.status === 'failed' && (
                              <motion.button
                                onClick={() => handleWorkflowAction(workflow.workflowId, 'retry')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30"
                              >
                                Retry
                              </motion.button>
                            )}
                            {workflow.status === 'active' && (
                              <motion.button
                                onClick={() => handleWorkflowAction(workflow.workflowId, 'pause')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm hover:bg-yellow-500/30"
                              >
                                Pause
                              </motion.button>
                            )}
                            {workflow.status === 'paused' && (
                              <motion.button
                                onClick={() => handleWorkflowAction(workflow.workflowId, 'resume')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30"
                              >
                                Resume
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => handleWorkflowAction(workflow.workflowId, 'cancel')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'errors':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Error Monitoring
              </h3>

              <div className="space-y-4">
                {errors.map((error) => (
                  <div key={error.id} className="p-4 bg-black/30 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          error.severity === 'critical' ? 'bg-red-500' :
                          error.severity === 'high' ? 'bg-orange-500' :
                          error.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">{error.message}</h4>
                          <p className="text-sm text-gray-400">
                            Last occurred: {new Date(error.lastOccurrence).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          error.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {error.severity.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-400 mt-1">{error.count} occurrences</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'users':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                User Management
              </h3>
              <p className="text-gray-400 mb-4">User disputes, support tickets, and account management.</p>

              <div className="space-y-4">
                {/* Mock dispute resolution interface */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h4 className="font-medium text-yellow-400 mb-2">Pending Dispute #1234</h4>
                  <p className="text-sm text-gray-300 mb-3">User reports failed transaction that was actually successful.</p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                    >
                      Resolve in Favor of User
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      Deny Claim
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Analytics Overview
              </h3>

              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-black/30 rounded-lg">
                    <h4 className="font-medium mb-2">Workflow Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Executions:</span>
                        <span className="font-medium">{metrics.totalExecutions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-400">{metrics.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span className="font-medium text-red-400">{metrics.errorRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/30 rounded-lg">
                    <h4 className="font-medium mb-2">User Engagement</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span className="font-medium">{metrics.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Workflows/User:</span>
                        <span className="font-medium">
                          {(metrics.totalWorkflows / Math.max(metrics.totalUsers, 1)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/30 rounded-lg">
                    <h4 className="font-medium mb-2">System Health</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Active Workflows:</span>
                        <span className="font-medium text-green-400">{metrics.activeWorkflows}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Workflows:</span>
                        <span className="font-medium text-red-400">
                          {workflows.filter(w => w.status === 'failed').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'system':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                System Administration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Feature Toggles</h4>
                  {[
                    { name: 'Forte Actions', enabled: true },
                    { name: 'NFT Rewards', enabled: true },
                    { name: 'Fiat Onboarding', enabled: true },
                    { name: 'Community Features', enabled: false },
                    { name: 'Advanced Analytics', enabled: true }
                  ].map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <span>{feature.name}</span>
                      <div className={`w-3 h-3 rounded-full ${feature.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">System Actions</h4>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30"
                    >
                      Refresh Forte Actions Cache
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30"
                    >
                      Update System Metrics
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30"
                    >
                      Clear Error Logs
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6"
      >
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-300 mt-2">Monitor and manage the FlowFi platform</p>
        </div>
      </motion.header>

      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-80"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </nav>

              <motion.button
                onClick={fetchDashboardData}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loading size="sm" text="Refreshing..." /> : '🔄 Refresh Data'}
              </motion.button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1"
          >
            {renderTabContent()}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Workflow Monitoring</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">User</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Last Execution</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr key={wf.id}>
                    <td>{wf.id}</td>
                    <td>{wf.user}</td>
                    <td className={wf.status === 'success' ? 'text-green-400' : 'text-red-400'}>{wf.status}</td>
                    <td>{wf.lastExecution}</td>
                    <td>
                      <button className="bg-yellow-600 px-2 py-1 rounded mr-2">Retry</button>
                      <button className="bg-red-600 px-2 py-1 rounded">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === 'errors' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Error Dashboard</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {errors.map((error) => (
              <div key={error.id} className="flex justify-between py-2">
                <span>{error.message}</span>
                <span className="text-red-400">{error.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p>User disputes and support management placeholder.</p>
            <button className="mt-2 bg-blue-600 px-4 py-2 rounded">Resolve Dispute</button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Analytics Overview</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p>Total Workflows: 150</p>
            <p>Active Workflows: 45</p>
            <p>Success Rate: 92%</p>
          </div>
        </div>
      )}
    </div>
  );
}