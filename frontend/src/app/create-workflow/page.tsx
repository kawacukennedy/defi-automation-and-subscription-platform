"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';

export default function CreateWorkflow() {
  const { user } = useWallet();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    action: '',
    token: 'FLOW',
    amount: '',
    frequency: 'once',
    trigger: 'manual'
  });
  const [loading, setLoading] = useState(false);

  const handleActionSelect = (action: string) => {
    setFormData(prev => ({ ...prev, action }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': user.addr
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        router.push('/dashboard');
      } else {
        alert('Error creating workflow: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create Workflow</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Select Action Type</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleActionSelect('stake')}
              className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                formData.action === 'stake' ? 'border-green-500 bg-green-50' : ''
              }`}
            >
              <h3 className="font-semibold">Stake Tokens</h3>
              <p>Automate staking rewards</p>
            </button>
            <button
              type="button"
              onClick={() => handleActionSelect('subscription')}
              className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                formData.action === 'subscription' ? 'border-green-500 bg-green-50' : ''
              }`}
            >
              <h3 className="font-semibold">Recurring Payment</h3>
              <p>Schedule crypto payments</p>
            </button>
            <button
              type="button"
              onClick={() => handleActionSelect('swap')}
              className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                formData.action === 'swap' ? 'border-green-500 bg-green-50' : ''
              }`}
            >
              <h3 className="font-semibold">Swap Tokens</h3>
              <p>Automated token swaps</p>
            </button>
            <button
              type="button"
              onClick={() => handleActionSelect('mint_nft')}
              className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                formData.action === 'mint_nft' ? 'border-green-500 bg-green-50' : ''
              }`}
            >
              <h3 className="font-semibold">Mint NFT</h3>
              <p>Create NFT rewards</p>
            </button>
          </div>

          <div className="mb-6">
            <label className="block mb-2">Workflow Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter workflow name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Describe your workflow"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Token</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.token}
              onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
            >
              <option>FLOW</option>
              <option>USDC</option>
              <option>FUSD</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-2">Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Frequency</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
            >
              <option value="once">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.action}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Deploy Workflow'}
          </button>
        </form>
      </main>
    </div>
  );
}