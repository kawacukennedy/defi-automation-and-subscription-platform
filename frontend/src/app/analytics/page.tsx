'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';

interface AnalyticsData {
  tokenBalances: { [key: string]: number };
  workflowPerformance: {
    totalExecutions: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  executionTrends: { date: string; executions: number; success: number }[];
  adoptionMetrics: { totalWorkflows: number; activeUsers: number; growth: number };
}

export default function Analytics() {
  const { user } = useWallet();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    token: 'all',
    action: 'all'
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, filters]);

  const fetchAnalytics = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockData: AnalyticsData = {
        tokenBalances: { FLOW: 100.5, USDC: 250.0, FUSD: 75.3 },
        workflowPerformance: {
          totalExecutions: 1250,
          successful: 1225,
          failed: 25,
          successRate: 98
        },
        executionTrends: [
          { date: '2024-01-01', executions: 45, success: 44 },
          { date: '2024-01-02', executions: 52, success: 51 },
          { date: '2024-01-03', executions: 38, success: 37 },
          { date: '2024-01-04', executions: 61, success: 60 },
          { date: '2024-01-05', executions: 49, success: 48 },
        ],
        adoptionMetrics: {
          totalWorkflows: 150,
          activeUsers: 89,
          growth: 12.5
        }
      };
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;

    const exportData = {
      filters,
      data,
      exportedAt: new Date().toISOString()
    };

    if (exportFormat === 'csv') {
      // Simple CSV export
      const csv = `Metric,Value\nTotal Workflows,${data.adoptionMetrics.totalWorkflows}\nActive Users,${data.adoptionMetrics.activeUsers}\nSuccess Rate,${data.workflowPerformance.successRate}%\nTotal Executions,${data.workflowPerformance.totalExecutions}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowfi-analytics.csv';
      a.click();
    } else {
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowfi-analytics.json';
      a.click();
    }
  };

  const SimpleBarChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="w-16 text-sm">{item.label}</span>
            <div className="flex-1 bg-white/10 rounded-full h-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full"
              />
            </div>
            <span className="w-12 text-sm text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

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
          Analytics & Insights
        </motion.h1>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <select
              value={filters.token}
              onChange={(e) => setFilters(prev => ({ ...prev, token: e.target.value }))}
              className="p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Tokens</option>
              <option value="FLOW">FLOW</option>
              <option value="USDC">USDC</option>
              <option value="FUSD">FUSD</option>
            </select>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="stake">Staking</option>
              <option value="swap">Swapping</option>
              <option value="payment">Payments</option>
            </select>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SimpleBarChart
            title="Token Balances"
            data={Object.entries(data?.tokenBalances || {}).map(([token, balance]) => ({
              label: token,
              value: Math.min((balance as number) / 3, 100) // Normalize for chart
            }))}
          />

          <SimpleBarChart
            title="Workflow Performance"
            data={[
              { label: 'Success', value: data?.workflowPerformance.successRate || 0 },
              { label: 'Failed', value: ((data?.workflowPerformance.failed || 0) / (data?.workflowPerformance.totalExecutions || 1)) * 100 }
            ]}
          />
        </div>

        {/* Execution Trends Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Execution Trends
          </h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {data?.executionTrends.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${(day.executions / 70) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="bg-gradient-to-t from-green-400 to-blue-500 rounded-t flex-1 flex flex-col justify-end items-center pb-2"
              >
                <span className="text-xs text-white font-semibold">{day.executions}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {data?.executionTrends.map(day => (
              <span key={day.date}>{new Date(day.date).toLocaleDateString()}</span>
            ))}
          </div>
        </motion.div>

        {/* Metrics Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Detailed Metrics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Metric</th>
                  <th className="text-left p-3">Value</th>
                  <th className="text-left p-3">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="p-3">Total Workflows</td>
                  <td className="p-3">{data?.adoptionMetrics.totalWorkflows}</td>
                  <td className="p-3 text-green-400">+12%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">Active Users</td>
                  <td className="p-3">{data?.adoptionMetrics.activeUsers}</td>
                  <td className="p-3 text-green-400">+8%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">Success Rate</td>
                  <td className="p-3">{data?.workflowPerformance.successRate}%</td>
                  <td className="p-3 text-green-400">+2%</td>
                </tr>
                <tr>
                  <td className="p-3">Total Executions</td>
                  <td className="p-3">{data?.workflowPerformance.totalExecutions}</td>
                  <td className="p-3 text-green-400">+15%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Predictive Analytics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Predictive Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">+23%</div>
              <div className="text-sm text-gray-400">Projected Growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">99.2%</div>
              <div className="text-sm text-gray-400">Predicted Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">185</div>
              <div className="text-sm text-gray-400">Workflows Next Month</div>
            </div>
          </div>
        </motion.div>

        {/* Export */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="text-green-400"
              />
              CSV
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="text-green-400"
              />
              JSON
            </label>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={exportData}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300"
          >
            Export Data
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}