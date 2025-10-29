"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/WalletContext';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">FlowFi Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Notifications</span>
            <span>Wallet: {user ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Active Workflows</h3>
            <p className="text-3xl font-bold text-green-600">{analytics?.workflows.active || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Executions</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics?.executions.total || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Success Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {analytics ? Math.round((analytics.executions.successful / analytics.executions.total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">NFT Badges</h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Workflows</h2>
          {workflows.length === 0 ? (
            <p className="text-gray-500">No workflows yet. Create your first workflow!</p>
          ) : (
            <div className="space-y-4">
              {workflows.slice(0, 5).map((workflow) => (
                <div key={workflow.workflowId} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <h3 className="font-semibold">{workflow.name || `Workflow ${workflow.workflowId.slice(-8)}`}</h3>
                    <p className="text-sm text-gray-600">{workflow.action} • {workflow.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Executions: {workflow.executionCount}</p>
                    <p className="text-sm text-gray-600">
                      Next: {workflow.nextExecution ? new Date(workflow.nextExecution).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul>
            {workflows.slice(0, 3).map((workflow) => (
              <li key={workflow.workflowId} className="py-2 border-b">
                Workflow '{workflow.name || workflow.workflowId.slice(-8)}' created
              </li>
            ))}
            {workflows.length === 0 && (
              <li className="py-2 text-gray-500">No recent activity</li>
            )}
          </ul>
        </div>

        <div className="text-center">
          <Link href="/create-workflow" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
            Create New Workflow
          </Link>
        </div>
      </main>
    </div>
  );
}