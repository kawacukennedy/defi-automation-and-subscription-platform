'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import Loading from '@/components/Loading';

interface Workflow {
  workflowId: string;
  name: string;
  action: string;
  status: string;
  executionCount: number;
  lastExecution?: string;
  nextExecution?: string;
}

interface Analytics {
  workflows: {
    total: number;
    active: number;
  };
  executions: {
    total: number;
    successful: number;
  };
}

export default function Dashboard() {
  const { user } = useWallet();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWorkflows();
      fetchAnalytics();
    }
  }, [user]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows', {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setWorkflows(result.data);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/user', {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <Loading size="lg" text="Loading Dashboard..." className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      {/* Top Nav */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4"
      >
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            FlowFi Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">User: {user?.addr?.slice(0, 6)}...{user?.addr?.slice(-4)}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              ☰
            </button>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: sidebarOpen ? 0 : -250 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="fixed md:relative z-10 w-64 min-h-screen bg-black/30 backdrop-blur-md border-r border-white/10 p-6"
        >
          <nav className="space-y-4">
            {[
              { href: '/dashboard', label: 'Dashboard', icon: '📊' },
              { href: '/create-workflow', label: 'Create Workflow', icon: '➕' },
              { href: '/analytics', label: 'Analytics', icon: '📈' },
              { href: '/community', label: 'Community', icon: '👥' },
              { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
              { href: '/settings', label: 'Settings', icon: '⚙️' },
              { href: '/admin', label: 'Admin', icon: '🛠️' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="group-hover:text-green-400 transition-colors">{item.label}</span>
              </Link>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { title: 'Active Workflows', value: analytics?.workflows.active || 0, color: 'from-green-400 to-green-600' },
              { title: 'Total Executions', value: analytics?.executions.total || 0, color: 'from-blue-400 to-blue-600' },
              { title: 'Success Rate', value: analytics ? Math.round((analytics.executions.successful / analytics.executions.total) * 100) : 0, color: 'from-purple-400 to-purple-600', suffix: '%' },
              { title: 'NFT Badges', value: 0, color: 'from-yellow-400 to-yellow-600' },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}
                className={`bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
              >
                <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}{stat.suffix}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Create Workflow', icon: '➕', href: '/create-workflow', color: 'from-green-400 to-green-600' },
                { label: 'View Analytics', icon: '📈', href: '/analytics', color: 'from-blue-400 to-blue-600' },
                { label: 'Community', icon: '👥', href: '/community', color: 'from-purple-400 to-purple-600' },
                { label: 'Settings', icon: '⚙️', href: '/settings', color: 'from-yellow-400 to-yellow-600' }
              ].map((action, index) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br ${action.color} bg-opacity-10 border border-white/10 p-4 rounded-xl text-center hover:border-white/20 transition-all cursor-pointer`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <p className="text-sm font-medium">{action.label}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Active Workflows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Active Workflows
            </h2>
            {workflows.length === 0 ? (
              <p className="text-gray-400">No workflows yet. Create your first workflow!</p>
            ) : (
               <div className="grid gap-4 md:grid-cols-2">
                 {workflows.slice(0, 6).map((workflow, index) => {
                   const statusConfig = {
                     active: { color: 'text-green-400', bg: 'bg-green-400/10', icon: '🟢', label: 'Active' },
                     paused: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: '⏸️', label: 'Paused' },
                     error: { color: 'text-red-400', bg: 'bg-red-400/10', icon: '❌', label: 'Error' },
                     completed: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '✅', label: 'Completed' }
                   };
                   const status = statusConfig[workflow.status as keyof typeof statusConfig] || statusConfig.active;

                   return (
                     <motion.div
                       key={workflow.workflowId}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.4, delay: index * 0.1 }}
                       whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,255,0,0.1)' }}
                       className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl hover:border-green-400/50 transition-all"
                     >
                       <div className="flex items-start justify-between mb-4">
                         <div className="flex-1">
                           <h3 className="font-semibold text-lg mb-1">{workflow.name || `Workflow ${workflow.workflowId.slice(-8)}`}</h3>
                           <p className="text-sm text-gray-400 mb-2">{workflow.action}</p>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} flex items-center gap-1`}>
                           <span>{status.icon}</span>
                           {status.label}
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                           <p className="text-sm text-gray-400">Executions</p>
                           <p className="text-lg font-semibold">{workflow.executionCount}</p>
                         </div>
                         <div>
                           <p className="text-sm text-gray-400">Success Rate</p>
                           <p className="text-lg font-semibold text-green-400">98%</p>
                         </div>
                       </div>

                       <div className="flex items-center justify-between text-sm">
                         <div>
                           <p className="text-gray-400">Last Execution</p>
                           <p>{workflow.lastExecution ? new Date(workflow.lastExecution).toLocaleDateString() : 'Never'}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-gray-400">Next Run</p>
                           <p>{workflow.nextExecution ? new Date(workflow.nextExecution).toLocaleDateString() : 'N/A'}</p>
                         </div>
                       </div>

                       <div className="mt-4 flex gap-2">
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                         >
                           Edit
                         </motion.button>
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                         >
                           Run Now
                         </motion.button>
                       </div>
                     </motion.div>
                   );
                 })}
              </div>
            )}
          </motion.div>

          {/* Recent Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Recent Activity
            </h2>
            <ul className="space-y-2">
              {workflows.slice(0, 3).map((workflow, index) => (
                <motion.li
                  key={workflow.workflowId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="py-2 border-b border-white/10 last:border-b-0"
                >
                  Workflow '{workflow.name || workflow.workflowId.slice(-8)}' executed successfully
                </motion.li>
              ))}
              {workflows.length === 0 && (
                <li className="py-2 text-gray-400">No recent activity</li>
              )}
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <Link href="/create-workflow">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,0,0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                Create New Workflow
              </motion.button>
            </Link>
          </motion.div>
        </main>
      </div>
    </div>
  );
}