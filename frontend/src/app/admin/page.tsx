'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('monitoring');

  // Mock data
  const workflows = [
    { id: 1, user: 'User1', status: 'success', lastExecution: '2023-10-01' },
    { id: 2, user: 'User2', status: 'failed', lastExecution: '2023-10-01' },
  ];

  const errors = [
    { id: 1, message: 'Insufficient balance', count: 5 },
    { id: 2, message: 'Network error', count: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 rounded ${activeTab === 'monitoring' ? 'bg-blue-600' : 'bg-gray-800'}`}
        >
          Monitoring
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 rounded ${activeTab === 'errors' ? 'bg-blue-600' : 'bg-gray-800'}`}
        >
          Errors
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-800'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded ${activeTab === 'analytics' ? 'bg-blue-600' : 'bg-gray-800'}`}
        >
          Analytics
        </button>
      </div>

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