'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import WalletConnectButton from '@/components/WalletConnectButton';

export const dynamic = 'force-dynamic';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  tokenBalances: { [key: string]: number };
  workflowPerformance: {
    totalExecutions: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  executionTrends: { date: string; executions: number; success: number; failed?: number }[];
  adoptionMetrics: { totalWorkflows: number; activeUsers: number; growth: number };
  predictive?: {
    predictions: { [key: string]: any };
    confidence: number;
    recommendations: any[];
  };
}

export default function Analytics() {
  const { user, connected } = useWallet();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    token: 'all',
    action: 'all'
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [predictiveData, setPredictiveData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, filters]);

  const fetchAnalytics = async () => {
    try {
      const [analyticsResponse, predictiveResponse] = await Promise.all([
        fetch('/api/analytics', {
          headers: { 'x-user-address': user?.addr || '' }
        }),
        fetch('/api/analytics/predictive', {
          headers: { 'x-user-address': user?.addr || '' }
        })
      ]);

      const analyticsResult = await analyticsResponse.json();
      const predictiveResult = await predictiveResponse.json();

      if (analyticsResult.success) {
        // Transform API data to match component interface
        const apiData = analyticsResult.data;
        const transformedData: AnalyticsData = {
          tokenBalances: { FLOW: 100.5, USDC: 250.0, FUSD: 75.3 }, // Mock for now - would come from wallet integration
          workflowPerformance: {
            totalExecutions: apiData.reduce((sum: number, day: any) => sum + (day.metrics?.totalExecutions || 0), 0),
            successful: apiData.reduce((sum: number, day: any) => sum + (day.metrics?.successfulExecutions || 0), 0),
            failed: apiData.reduce((sum: number, day: any) => sum + (day.metrics?.failedExecutions || 0), 0),
            successRate: apiData.length > 0 ? Math.round(apiData.reduce((sum: number, day: any) => sum + (day.performance?.successRate || 0), 0) / apiData.length) : 0
          },
          executionTrends: apiData.slice(-30).map((day: any) => ({ // Last 30 days
            date: new Date(day.date).toLocaleDateString(),
            executions: day.metrics?.totalExecutions || 0,
            success: day.metrics?.successfulExecutions || 0,
            failed: (day.metrics?.totalExecutions || 0) - (day.metrics?.successfulExecutions || 0)
          })),
          adoptionMetrics: {
            totalWorkflows: apiData.reduce((sum: number, day: any) => sum + (day.metrics?.totalWorkflows || 0), 0),
            activeUsers: apiData.reduce((sum: number, day: any) => sum + (day.metrics?.activeUsers || 0), 0),
            growth: apiData.length > 1 ? ((apiData[apiData.length - 1].metrics?.totalWorkflows || 0) - (apiData[0].metrics?.totalWorkflows || 0)) / (apiData[0].metrics?.totalWorkflows || 1) * 100 : 0
          }
        };
        setData(transformedData);
      }

      if (predictiveResult.success) {
        setPredictiveData(predictiveResult.data);
      }
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            Connect your Flow wallet to view analytics and insights.
          </p>
          <WalletConnectButton />
        </motion.div>
      </div>
    );
  }

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
          {/* Token Balances Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Token Balances Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data?.tokenBalances || {}).map(([token, balance], index) => ({
                    name: token,
                    value: balance as number,
                    fill: ['#00EF8B', '#00A3FF', '#FF6B35'][index % 3]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(data?.tokenBalances || {}).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#00EF8B', '#00A3FF', '#FF6B35'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workflow Performance Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Workflow Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Successful', value: data?.workflowPerformance.successful || 0, fill: '#00EF8B' },
                  { name: 'Failed', value: data?.workflowPerformance.failed || 0, fill: '#FF6B35' }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Execution Trends Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Execution Trends Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data?.executionTrends.map(trend => ({
                date: new Date(trend.date).toLocaleDateString(),
                executions: trend.executions,
                successful: trend.success
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="executions"
                stackId="1"
                stroke="#00A3FF"
                fill="#00A3FF"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="successful"
                stackId="2"
                stroke="#00EF8B"
                fill="#00EF8B"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
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

        {/* Adoption Trends Line Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Adoption Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { month: 'Jan', workflows: 120, users: 75 },
                { month: 'Feb', workflows: 135, users: 82 },
                { month: 'Mar', workflows: 148, users: 89 },
                { month: 'Apr', workflows: 156, users: 94 },
                { month: 'May', workflows: 167, users: 101 },
                { month: 'Jun', workflows: 175, users: 108 }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="workflows"
                stroke="#00EF8B"
                strokeWidth={3}
                dot={{ fill: '#00EF8B', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#00A3FF"
                strokeWidth={3}
                dot={{ fill: '#00A3FF', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Predictive Analytics */}
        {predictiveData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              AI-Powered Predictive Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {predictiveData.predictions && Object.entries(predictiveData.predictions).slice(0, 3).map(([key, prediction]: [string, any], index) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  className={`text-center p-4 bg-gradient-to-br ${
                    key.includes('totalUsers') ? 'from-green-400/10 to-green-600/10 border-green-400/20' :
                    key.includes('totalWorkflows') ? 'from-blue-400/10 to-blue-600/10 border-blue-400/20' :
                    'from-purple-400/10 to-purple-600/10 border-purple-400/20'
                  } rounded-xl border`}
                >
                  <div className={`text-3xl font-bold mb-2 ${
                    prediction.trend === 'increasing' ? 'text-green-400' :
                    prediction.trend === 'decreasing' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {prediction.change > 0 ? '+' : ''}{prediction.change?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-300 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-400">
                    Predicted: {prediction.predicted || 0} • {prediction.trend || 'stable'}
                  </div>
                </motion.div>
              ))}
            </div>

            {predictiveData.recommendations && predictiveData.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">AI Recommendations</h3>
                <div className="space-y-2">
                  {predictiveData.recommendations.map((rec: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      rec.priority === 'high' ? 'bg-red-500/10 border-red-400/20' :
                      rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-400/20' :
                      'bg-blue-500/10 border-blue-400/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="font-medium">{rec.type}</span>
                      </div>
                      <p className="text-sm text-gray-300">{rec.message}</p>
                      {rec.action && <p className="text-xs text-gray-400 mt-1">💡 {rec.action}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Predictions powered by machine learning analysis • Confidence: {predictiveData.confidence?.toFixed(1) || 0}%
              </p>
            </div>
          </motion.div>
        )}

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