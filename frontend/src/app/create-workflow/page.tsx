'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
    trigger: 'manual',
    schedule: '',
    recipient: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const actions = [
    { id: 'stake', name: 'Stake Tokens', desc: 'Automate staking rewards', icon: '🏦' },
    { id: 'subscription', name: 'Recurring Payment', desc: 'Schedule crypto payments', icon: '💰' },
    { id: 'swap', name: 'Swap Tokens', desc: 'Automated token swaps', icon: '🔄' },
    { id: 'send', name: 'Send Tokens', desc: 'Transfer tokens automatically', icon: '📤' },
    { id: 'mint_nft', name: 'Mint NFT', desc: 'Create NFT rewards', icon: '🎨' },
    { id: 'dao_vote', name: 'DAO Vote', desc: 'Automated governance voting', icon: '🗳️' },
  ];

  const tokens = ['FLOW', 'USDC', 'FUSD', 'USDT'];

  const handleActionSelect = (action: string) => {
    setFormData(prev => ({ ...prev, action }));
    setErrors(prev => ({ ...prev, action: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Workflow name is required';
    if (!formData.action) newErrors.action = 'Please select an action';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (formData.action === 'send' && !formData.recipient) newErrors.recipient = 'Recipient address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

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
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Failed to create workflow' });
    } finally {
      setLoading(false);
    }
  };

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
          Create Workflow
        </motion.h1>

        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-2xl max-w-4xl mx-auto shadow-2xl"
        >
          {/* Action Selector */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Select Action Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  type="button"
                  onClick={() => handleActionSelect(action.id)}
                  onMouseEnter={() => setShowTooltip(action.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`p-6 border-2 rounded-xl transition-all duration-300 text-left ${
                    formData.action === action.id
                      ? 'border-green-400 bg-green-400/20 shadow-lg shadow-green-400/25'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <h3 className="font-semibold text-lg mb-1">{action.name}</h3>
                  <p className="text-gray-300 text-sm">{action.desc}</p>
                </motion.button>
              ))}
            </div>
            {errors.action && <p className="text-red-400 mt-2">{errors.action}</p>}
          </div>

          {/* Workflow Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label className="block mb-2 font-semibold">Workflow Name</label>
              <input
                type="text"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                placeholder="Enter workflow name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <p className="text-red-400 mt-1">{errors.name}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label className="block mb-2 font-semibold">Token</label>
              <select
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                value={formData.token}
                onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-6"
          >
            <label className="block mb-2 font-semibold">Description</label>
            <textarea
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors h-24 resize-none"
              placeholder="Describe your workflow"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <label className="block mb-2 font-semibold">Amount</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
              {errors.amount && <p className="text-red-400 mt-1">{errors.amount}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <label className="block mb-2 font-semibold">Frequency & Schedule</label>
              <select
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <option value="once">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </motion.div>
          </div>

          {formData.action === 'send' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <label className="block mb-2 font-semibold">Recipient Address</label>
              <input
                type="text"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                placeholder="Enter Flow address"
                value={formData.recipient}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
              />
              {errors.recipient && <p className="text-red-400 mt-1">{errors.recipient}</p>}
            </motion.div>
          )}

          {/* Trigger Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={() => setShowTriggerModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Configure Trigger
            </button>
          </motion.div>

          {errors.submit && <p className="text-red-400 mb-4">{errors.submit}</p>}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={handlePreview}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
            >
              Preview Workflow
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading || !formData.action}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Deploying...' : 'Deploy Workflow'}
            </motion.button>
          </div>
        </motion.form>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md w-full"
              >
                <h3 className="text-xl font-semibold mb-4">Workflow Preview</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Action:</strong> {actions.find(a => a.id === formData.action)?.name}</p>
                  <p><strong>Token:</strong> {formData.token}</p>
                  <p><strong>Amount:</strong> {formData.amount}</p>
                  <p><strong>Frequency:</strong> {formData.frequency}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleSubmit(new Event('submit') as any);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Modal */}
        <AnimatePresence>
          {showTriggerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowTriggerModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md w-full"
              >
                <h3 className="text-xl font-semibold mb-4">Trigger Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Trigger Type</label>
                    <select
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                      value={formData.trigger}
                      onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                    >
                      <option value="manual">Manual</option>
                      <option value="time">Time-based</option>
                      <option value="event">Event-based</option>
                    </select>
                  </div>
                  {formData.trigger === 'time' && (
                    <div>
                      <label className="block mb-2">Schedule</label>
                      <input
                        type="datetime-local"
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg"
                        value={formData.schedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowTriggerModal(false)}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
                >
                  Save Configuration
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-20 right-4 bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-lg max-w-xs z-40"
            >
              <p className="text-sm">
                {actions.find(a => a.id === showTooltip)?.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}