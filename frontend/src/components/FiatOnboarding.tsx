'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from './Loading';

interface Currency {
  code: string;
  name: string;
  minAmount: number;
  maxAmount: number;
}

interface OnboardingStatus {
  hasOnboarded: boolean;
  totalPurchased: number;
  lastPurchase: string | null;
  availableCurrencies: string[];
}

export default function FiatOnboarding() {
  const { user } = useWallet();
  const { success, error: showError } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('FLOW');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [moonpayUrl, setMoonpayUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
    fetchOnboardingStatus();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/fiat-onboarding/currencies');
      const result = await response.json();
      if (result.success) {
        setCurrencies(result.currencies);
      }
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
    }
  };

  const fetchOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/fiat-onboarding/status', {
        headers: {
          'x-user-address': user?.addr || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setOnboardingStatus(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding status:', err);
    }
  };

  const handlePurchase = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showError('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/fiat-onboarding/moonpay-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': user?.addr || ''
        },
        body: JSON.stringify({
          currencyCode: selectedCurrency,
          baseCurrencyAmount: parseFloat(amount)
        })
      });

      const result = await response.json();
      if (result.success) {
        setMoonpayUrl(result.widgetUrl);
        success('Moonpay Widget Ready', 'Click the button below to complete your purchase');
      } else {
        showError('Purchase Failed', result.error || 'Failed to generate Moonpay URL');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      showError('Purchase Failed', 'Failed to initiate purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openMoonpayWidget = () => {
    if (moonpayUrl) {
      window.open(moonpayUrl, '_blank', 'width=600,height=800');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-900/20 to-blue-900/20 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Fiat Onboarding
        </h2>
        <p className="text-gray-300">
          Buy crypto with your credit card or bank transfer
        </p>
      </div>

      {/* Onboarding Status */}
      {onboardingStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/30 rounded-xl p-4 mb-6"
        >
          <h3 className="font-semibold mb-2">Your Onboarding Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Purchased:</span>
              <span className="ml-2 font-medium">${onboardingStatus.totalPurchased.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 font-medium ${onboardingStatus.hasOnboarded ? 'text-green-400' : 'text-yellow-400'}`}>
                {onboardingStatus.hasOnboarded ? 'Complete' : 'Not Started'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Currency Selection */}
      <div className="mb-6">
        <label className="block mb-3 font-semibold">Select Cryptocurrency</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => setSelectedCurrency(currency.code)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCurrency === currency.code
                  ? 'border-green-400 bg-green-400/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="font-medium">{currency.name}</div>
              <div className="text-sm text-gray-400">{currency.code}</div>
              <div className="text-xs text-gray-500 mt-1">
                ${currency.minAmount} - ${currency.maxAmount}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block mb-3 font-semibold">Purchase Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in USD"
          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
          min="10"
          max="50000"
        />
        <p className="text-sm text-gray-400 mt-2">
          Minimum purchase: $10 | Maximum: $50,000
        </p>
      </div>

      {/* Purchase Button */}
      <div className="text-center">
        {!moonpayUrl ? (
          <motion.button
            onClick={handlePurchase}
            disabled={loading || !amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            {loading ? <Loading size="sm" /> : '🛒'}
            {loading ? 'Generating...' : 'Buy with Moonpay'}
          </motion.button>
        ) : (
          <motion.button
            onClick={openMoonpayWidget}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            🌐 Open Moonpay Widget
          </motion.button>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Powered by Moonpay • Secure • Instant • Global</p>
        <p className="mt-1">Supported payment methods: Credit Card, Debit Card, Bank Transfer</p>
      </div>
    </motion.div>
  );
}