'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';
import FiatOnboarding from '@/components/FiatOnboarding';

export const dynamic = 'force-dynamic';

interface NotificationSettings {
  workflowExecutions: boolean;
  paymentReminders: boolean;
  achievementUnlocks: boolean;
  communityUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'community';
  dataSharing: boolean;
  analyticsTracking: boolean;
}

export default function Settings() {
  const { user, connected, walletType, switchWallet, disconnectWallet } = useWallet();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    workflowExecutions: true,
    paymentReminders: true,
    achievementUnlocks: true,
    communityUpdates: false,
    securityAlerts: true,
    marketingEmails: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'community',
    dataSharing: false,
    analyticsTracking: true,
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    displayName: '',
    email: '',
    bio: '',
    timezone: 'UTC',
    currency: 'USD',
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  });

  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('flowfi-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setNotifications(prev => ({ ...prev, ...parsed.notifications }));
      setPrivacy(prev => ({ ...prev, ...parsed.privacy }));
      setAccountSettings(prev => ({ ...prev, ...parsed.account }));
      setSecuritySettings(prev => ({ ...prev, ...parsed.security }));
    }
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settings = {
        notifications,
        privacy,
        account: accountSettings,
        security: securitySettings,
      };

      localStorage.setItem('flowfi-settings', JSON.stringify(settings));

      // Here you would typically send to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      success('Settings Saved', 'Your preferences have been updated successfully.');
    } catch (err) {
      error('Save Failed', 'Unable to save your settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'wallets', label: 'Wallets', icon: '🔑' },
    { id: 'fiat', label: 'Fiat Onboarding', icon: '💰' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallets':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Wallet Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      {walletType === 'dapper' ? '🦆' : walletType === 'blocto' ? '🔵' : walletType === 'lilico' ? '🟣' : '🔗'}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{walletType || 'Flow'} Wallet</p>
                      <p className="text-sm text-gray-400">
                        {connected && user?.addr ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {connected && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Connected</span>}
                    {!connected && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Disconnected</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-sm text-gray-300">Available Wallets</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'dapper', name: 'Dapper', icon: '🦆', desc: 'Popular Flow wallet' },
                    { type: 'blocto', name: 'Blocto', icon: '🔵', desc: 'Multi-chain wallet' },
                    { type: 'lilico', name: 'Lilico', icon: '🟣', desc: 'Flow native wallet' },
                    { type: 'ledger', name: 'Ledger', icon: '🔐', desc: 'Hardware wallet' }
                  ].map((wallet) => (
                    <motion.button
                      key={wallet.type}
                      onClick={() => switchWallet(wallet.type)}
                      disabled={walletType === wallet.type && connected}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        walletType === wallet.type && connected
                          ? 'border-green-400 bg-green-400/10'
                          : 'border-white/20 bg-black/30 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{wallet.icon}</span>
                        <span className="font-medium text-sm">{wallet.name}</span>
                      </div>
                      <p className="text-xs text-gray-400">{wallet.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {connected && (
                <motion.button
                  onClick={disconnectWallet}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                >
                  Disconnect Wallet
                </motion.button>
              )}
            </div>
          </motion.div>
        );

      case 'fiat':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <FiatOnboarding />
          </motion.div>
        );

      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Profile Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={accountSettings.displayName}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={accountSettings.bio}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors h-24 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={accountSettings.timezone}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Currency</label>
                  <select
                    value={accountSettings.currency}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="FLOW">FLOW</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>
             </div>
                     <div>
                       <p className="font-medium capitalize">{walletType || 'Flow'} Wallet</p>
                       <p className="text-sm text-gray-400">
                         {connected && user?.addr ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}` : 'Not connected'}
                       </p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     {connected && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Connected</span>}
                     {!connected && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Disconnected</span>}
                   </div>
                 </div>
               </div>

               <div className="mt-6 space-y-3">
                 <h4 className="font-medium text-sm text-gray-300">Available Wallets</h4>
                 <div className="grid grid-cols-2 gap-3">
                   {[
                     { type: 'dapper', name: 'Dapper', icon: '🦆', desc: 'Popular Flow wallet' },
                     { type: 'blocto', name: 'Blocto', icon: '🔵', desc: 'Multi-chain wallet' },
                     { type: 'lilico', name: 'Lilico', icon: '🟣', desc: 'Flow native wallet' },
                     { type: 'ledger', name: 'Ledger', icon: '🔐', desc: 'Hardware wallet' }
                   ].map((wallet) => (
                     <motion.button
                       key={wallet.type}
                       onClick={() => switchWallet(wallet.type)}
                       disabled={walletType === wallet.type && connected}
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       className={`p-3 rounded-lg border text-left transition-all ${
                         walletType === wallet.type && connected
                           ? 'border-green-400 bg-green-400/10'
                           : 'border-white/20 bg-black/30 hover:border-white/30'
                       }`}
                     >
                       <div className="flex items-center gap-2 mb-1">
                         <span>{wallet.icon}</span>
                         <span className="font-medium text-sm">{wallet.name}</span>
                       </div>
                       <p className="text-xs text-gray-400">{wallet.desc}</p>
                     </motion.button>
                   ))}
                 </div>
               </div>

               {connected && (
                 <motion.button
                   onClick={disconnectWallet}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="mt-4 w-full bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                 >
                   Disconnect Wallet
                 </motion.button>
               )}
             </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <p className="text-sm text-gray-400">
                        {key === 'workflowExecutions' && 'Get notified when your workflows execute'}
                        {key === 'paymentReminders' && 'Reminders for upcoming payments'}
                        {key === 'achievementUnlocks' && 'Celebrate your achievements'}
                        {key === 'communityUpdates' && 'Updates from the FlowFi community'}
                        {key === 'securityAlerts' && 'Important security notifications'}
                        {key === 'marketingEmails' && 'Product updates and promotions'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Privacy Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Profile Visibility</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                      { value: 'community', label: 'Community', desc: 'Only community members' },
                      { value: 'private', label: 'Private', desc: 'Only you can see' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setPrivacy(prev => ({ ...prev, profileVisibility: option.value as any }))}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          privacy.profileVisibility === option.value
                            ? 'border-green-400 bg-green-400/10'
                            : 'border-white/20 bg-black/30 hover:border-white/30'
                        }`}
                      >
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-400 mt-1">{option.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-gray-400">Share anonymized usage data to improve FlowFi</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.dataSharing}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, dataSharing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">Analytics Tracking</h4>
                    <p className="text-sm text-gray-400">Help us improve by tracking app usage</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.analyticsTracking}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, analyticsTracking: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Security Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${securitySettings.twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </motion.button>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                    <option value="0">Never</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Notifications</h4>
                    <p className="text-sm text-gray-400">Get notified of new login attempts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'integrations':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Connected Integrations
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Flow Blockchain', status: 'connected', icon: '🌊', desc: 'Primary blockchain integration' },
                  { name: 'Forte Actions', status: 'connected', icon: '⚡', desc: 'Smart contract automation' },
                  { name: 'Moonpay', status: 'connected', icon: '🌙', desc: 'Fiat to crypto payments' },
                  { name: 'QuickNode', status: 'connected', icon: '🚀', desc: 'Enhanced RPC endpoints' },
                  { name: 'Thirdweb', status: 'pending', icon: '🔧', desc: 'Web3 development tools' },
                  { name: 'Privy', status: 'pending', icon: '🔐', desc: 'Wallet authentication' }
                ].map((integration) => (
                  <div key={integration.name} className="p-4 bg-black/30 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-400">{integration.desc}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        integration.status === 'connected'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        integration.status === 'connected'
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6"
      >
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-300 mt-2">Manage your account preferences and integrations</p>
        </div>
      </motion.header>

      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-80"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <nav className="space-y-2" role="tablist" aria-label="Settings navigation">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30'
                        : 'hover:bg-white/5'
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                  >
                    <span className="text-xl" aria-hidden="true">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </nav>

              <motion.button
                onClick={saveSettings}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loading size="sm" text="Saving..." /> : 'Save Settings'}
              </motion.button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            id={`panel-${activeTab}`}
          >
            {renderTabContent()}
          </motion.main>
        </div>
      </div>
    </div>
  );
}