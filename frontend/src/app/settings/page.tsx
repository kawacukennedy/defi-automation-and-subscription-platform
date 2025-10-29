'use client';

import { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    telegram: false,
  });
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Wallet Management */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Wallet Management</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p>Connected Wallets: Dapper, Blocto</p>
          <button className="mt-2 bg-blue-600 px-4 py-2 rounded">Add Wallet</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
        <div className="bg-gray-800 p-4 rounded-lg space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              className="mr-2"
            />
            Email Notifications
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.inApp}
              onChange={(e) => setNotifications({...notifications, inApp: e.target.checked})}
              className="mr-2"
            />
            In-App Notifications
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.telegram}
              onChange={(e) => setNotifications({...notifications, telegram: e.target.checked})}
              className="mr-2"
            />
            Telegram Notifications
          </label>
        </div>
      </div>

      {/* Theme */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Theme</h2>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      {/* Security & Privacy */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Security & Privacy</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p>Multi-sig Settings: Enabled for DAOs</p>
          <button className="mt-2 bg-red-600 px-4 py-2 rounded">Change Password</button>
        </div>
      </div>

      {/* Language */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Language</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* API Keys & Integrations */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">API Keys & Integrations</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p>Integrations: Moonpay, Privy, Thirdweb</p>
          <button className="mt-2 bg-green-600 px-4 py-2 rounded">Manage Integrations</button>
        </div>
      </div>
    </div>
  );
}