"use client";

import { useEffect, useState } from 'react';

interface LeaderboardUser {
  address: string;
  username?: string;
  reputationScore: number;
  totalWorkflows: number;
  totalExecutions: number;
  achievements: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Mock data for now
      const mockData: LeaderboardUser[] = [
        {
          address: '0x1234...abcd',
          username: 'DeFiMaster',
          reputationScore: 1250,
          totalWorkflows: 45,
          totalExecutions: 1200,
          achievements: 8,
          rank: 1
        },
        {
          address: '0x5678...efgh',
          username: 'FlowAutomator',
          reputationScore: 1100,
          totalWorkflows: 38,
          totalExecutions: 950,
          achievements: 6,
          rank: 2
        },
        {
          address: '0x9abc...ijkl',
          username: 'StakingPro',
          reputationScore: 980,
          totalWorkflows: 32,
          totalExecutions: 800,
          achievements: 5,
          rank: 3
        }
      ];
      setLeaderboard(mockData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Top Contributors</h2>
            <p className="text-gray-600 dark:text-gray-400">Ranked by reputation score</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Workflows
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Executions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Achievements
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((user) => (
                  <tr key={user.address} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          user.rank === 1 ? 'bg-yellow-500' :
                          user.rank === 2 ? 'bg-gray-400' :
                          user.rank === 3 ? 'bg-orange-500' : 'bg-gray-300'
                        }`}>
                          {user.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {(user.username || user.address.slice(-2)).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username || `User ${user.address.slice(-8)}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.address.slice(0, 6)}...{user.address.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {user.reputationScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.totalWorkflows}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.totalExecutions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {user.achievements}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">How Rankings Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">WF</span>
              </div>
              <h3 className="font-semibold mb-2">Workflows Created</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Earn points for each workflow you create and share</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 font-bold">EX</span>
              </div>
              <h3 className="font-semibold mb-2">Successful Executions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points for each successful workflow execution</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">★</span>
              </div>
              <h3 className="font-semibold mb-2">Achievements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bonus points for unlocking achievements and badges</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}