'use client';

import { useState } from 'react';

export default function CommunityHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data for demonstration
  const templates = [
    { id: 1, name: 'Staking Workflow', creator: 'User1', votes: 45, forks: 12, action: 'stake', token: 'FLOW' },
    { id: 2, name: 'Recurring Payment', creator: 'User2', votes: 32, forks: 8, action: 'payment', token: 'USDC' },
    // Add more mock data
  ];

  const contributors = [
    { name: 'User1', workflows: 15, reputation: 1200 },
    { name: 'User2', workflows: 10, reputation: 950 },
    // Add more
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Community Hub</h1>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 bg-gray-800 rounded"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        >
          <option value="all">All Actions</option>
          <option value="stake">Staking</option>
          <option value="swap">Swapping</option>
          <option value="payment">Payments</option>
        </select>
      </div>

      {/* Trending Templates */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Trending Workflow Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-medium">{template.name}</h3>
              <p className="text-gray-400">by {template.creator}</p>
              <div className="flex justify-between mt-2">
                <span>👍 {template.votes}</span>
                <span>🍴 {template.forks}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="bg-blue-600 px-3 py-1 rounded">Fork</button>
                <button className="bg-green-600 px-3 py-1 rounded">Vote</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Top Contributors</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          {contributors.map((user, index) => (
            <div key={user.name} className="flex justify-between py-2">
              <span>{index + 1}. {user.name}</span>
              <span>{user.reputation} rep</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}