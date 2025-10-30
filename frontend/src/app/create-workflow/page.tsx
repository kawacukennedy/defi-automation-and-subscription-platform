'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';

type Step = 'action' | 'details' | 'triggers' | 'review';

export default function CreateWorkflow() {
  const { user } = useWallet();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('action');
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const steps = [
    { id: 'action' as Step, title: 'Choose Action', icon: '🎯' },
    { id: 'details' as Step, title: 'Configure Details', icon: '⚙️' },
    { id: 'triggers' as Step, title: 'Set Triggers', icon: '⏰' },
    { id: 'review' as Step, title: 'Review & Deploy', icon: '🚀' },
  ];

  const actions = [
    { id: 'stake', name: 'Stake Tokens', desc: 'Automate staking rewards', icon: '🏦' },
    { id: 'subscription', name: 'Recurring Payment', desc: 'Schedule crypto payments', icon: '💰' },
    { id: 'swap', name: 'Swap Tokens', desc: 'Automated token swaps', icon: '🔄' },
    { id: 'send', name: 'Send Tokens', desc: 'Transfer tokens automatically', icon: '📤' },
    { id: 'mint_nft', name: 'Mint NFT', desc: 'Create NFT rewards', icon: '🎨' },
    { id: 'dao_vote', name: 'DAO Vote', desc: 'Automated governance voting', icon: '🗳️' },
  ];

  const tokens = ['FLOW', 'USDC', 'FUSD', 'USDT'];

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'action':
        return !!formData.action;
      case 'details':
        return !!formData.name && !!formData.amount && parseFloat(formData.amount) > 0;
      case 'triggers':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

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
        success('Workflow Created!', 'Your workflow has been deployed successfully.');
        router.push('/dashboard');
      } else {
        showError('Deployment Failed', result.error || 'Failed to create workflow');
      }
    } catch (err) {
      console.error('Error:', err);
      showError('Deployment Failed', 'Failed to create workflow. Please try again.');
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

        {/* Step Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'border-green-400 text-green-400 bg-green-400/20'
                        : 'border-white/30 text-white/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isCompleted ? '✓' : step.icon}
                  </motion.div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-white/70'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-white/30'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          key={currentStep}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-2xl max-w-4xl mx-auto shadow-2xl"
        >
          {/* Step Content */}
          {currentStep === 'action' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                What would you like to automate?
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
          )}

          {currentStep === 'details' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Configure Your Workflow
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
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
                  transition={{ duration: 0.5, delay: 0.1 }}
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
                transition={{ duration: 0.5, delay: 0.2 }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
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
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="block mb-2 font-semibold">Frequency</label>
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
                  transition={{ duration: 0.5, delay: 0.5 }}
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
            </div>
          )}

          {currentStep === 'triggers' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                When should this run?
              </h2>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/30 p-6 rounded-xl"
                >
                  <label className="block mb-3 font-semibold">Trigger Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'manual', label: 'Manual', desc: 'Run when you click execute' },
                      { value: 'time', label: 'Scheduled', desc: 'Run at specific times' },
                      { value: 'event', label: 'Event-based', desc: 'Run when conditions met' }
                    ].map((trigger) => (
                      <button
                        key={trigger.value}
                        onClick={() => setFormData(prev => ({ ...prev, trigger: trigger.value }))}
                        className={`p-4 rounded-lg border transition-all ${
                          formData.trigger === trigger.value
                            ? 'border-green-400 bg-green-400/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <h4 className="font-medium">{trigger.label}</h4>
                        <p className="text-sm text-gray-400 mt-1">{trigger.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {formData.trigger === 'time' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/30 p-6 rounded-xl"
                  >
                    <label className="block mb-3 font-semibold">Schedule</label>
                    <input
                      type="datetime-local"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                      value={formData.schedule}
                      onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Choose when you want this workflow to first execute
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Review Your Workflow
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 p-6 rounded-xl mb-6"
              >
                <h3 className="text-lg font-semibold mb-4">Workflow Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="ml-2 font-medium">{formData.name || 'Untitled Workflow'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Action:</span>
                    <span className="ml-2 font-medium">{actions.find(a => a.id === formData.action)?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Token:</span>
                    <span className="ml-2 font-medium">{formData.token}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <span className="ml-2 font-medium">{formData.amount} {formData.token}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Frequency:</span>
                    <span className="ml-2 font-medium capitalize">{formData.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Trigger:</span>
                    <span className="ml-2 font-medium capitalize">{formData.trigger}</span>
                  </div>
                  {formData.schedule && (
                    <div className="md:col-span-2">
                      <span className="text-gray-400">Next Run:</span>
                      <span className="ml-2 font-medium">{new Date(formData.schedule).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                className="bg-black/30 p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="confirm"
                    className="mr-3 w-4 h-4"
                    required
                  />
                  <label htmlFor="confirm" className="text-sm">
                    I confirm that I want to deploy this workflow to the Flow blockchain
                  </label>
                </div>
                {errors.submit && <p className="text-red-400 mb-4">{errors.submit}</p>}
              </motion.form>
            </div>
          )}

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

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-between mt-8"
          >
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 'action'}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep !== 'review' ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                >
                  Next
                </button>
              ) : (
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,0,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? <Loading size="sm" /> : '🚀'}
                  {loading ? 'Deploying...' : 'Deploy Workflow'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Action Tooltip */}
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