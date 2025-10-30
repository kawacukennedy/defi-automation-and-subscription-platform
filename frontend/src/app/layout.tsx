'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/WalletContext";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load heavy components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-4 w-20"></div>
});

const MotionNav = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.nav })), {
  ssr: false,
  loading: () => <nav className="p-4 bg-gray-100">Loading navigation...</nav>
});

const MotionFooter = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.footer })), {
  ssr: false,
  loading: () => <footer className="py-12 bg-gray-100">Loading footer...</footer>
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowFi - DeFi Automation & Subscription Platform",
  description: "Automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance on Flow blockchain",
  keywords: ["DeFi", "Flow", "Blockchain", "Automation", "Crypto", "NFT", "DAO", "Web3"],
  authors: [{ name: "FlowFi Team" }],
  creator: "FlowFi",
  publisher: "FlowFi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flowfi.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FlowFi - DeFi Automation Platform",
    description: "Automate your DeFi workflows on Flow blockchain with AI-powered insights",
    url: 'https://flowfi.vercel.app',
    siteName: 'FlowFi',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowFi - DeFi Automation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FlowFi - DeFi Automation Platform",
    description: "Automate your DeFi workflows on Flow blockchain",
    images: ['/og-image.png'],
    creator: '@flowfi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Workflow "Staking" executed successfully', time: '2 min ago', unread: true },
    { id: 2, message: 'New achievement unlocked: "Early Adopter"', time: '1 hour ago', unread: true },
    { id: 3, message: 'Community template forked by user', time: '3 hours ago', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="FlowFi" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FlowFi" />
        <meta name="description" content="Automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance on Flow blockchain" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#00ef8b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#00ef8b" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00ef8b" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://access-testnet.onflow.org" />
        <link rel="dns-prefetch" href="//access-testnet.onflow.org" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300 ${
          darkMode ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white' : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-900'
        }`}
      >
        <WalletProvider>
          {/* Navigation */}
          <Suspense fallback={<nav className="p-4 bg-gray-100 animate-pulse">Loading navigation...</nav>}>
            <MotionNav
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`backdrop-blur-md border-b ${
                darkMode ? 'bg-black/20 border-white/10' : 'bg-white/20 border-gray-200'
              } p-4 sticky top-0 z-50`}
            >
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                FlowFi
              </Link>
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex space-x-4">
                  <Link href="/dashboard" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</Link>
                  <Link href="/create-workflow" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Workflow</Link>
                  <Link href="/analytics" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</Link>
                  <Link href="/community" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Community</Link>
                  <Link href="/leaderboard" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Leaderboard</Link>
                  <Link href="/settings" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</Link>
                  <Link href="/admin" className={`hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin</Link>
                </div>

                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                  }`}
                >
                  {darkMode ? '☀️' : '🌙'}
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-lg transition-colors relative ${
                      darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                    }`}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-80 ${
                        darkMode ? 'bg-black/90 backdrop-blur-md border-white/10' : 'bg-white/90 backdrop-blur-md border-gray-200'
                      } border rounded-xl shadow-xl z-50`}
                    >
                      <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} hover:bg-white/10 transition-colors cursor-pointer`}
                          >
                            <p className={`text-sm ${notification.unread ? 'font-semibold' : ''}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 text-center">
                        <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                          View All Notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <button className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                    ☰
                  </button>
                </div>
              </div>
            </div>
            </MotionNav>
          </Suspense>

          {/* Main Content */}
          <main className="min-h-screen">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <Suspense fallback={<footer className="py-12 bg-gray-100 animate-pulse">Loading footer...</footer>}>
            <MotionFooter
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`backdrop-blur-md border-t ${
                darkMode ? 'bg-black/20 border-white/10' : 'bg-white/20 border-gray-200'
              } py-12`}
            >
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
                    FlowFi
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Automating DeFi workflows on Flow blockchain with Forte Actions and AI-powered insights.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Product</h4>
                  <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li><Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link></li>
                    <li><Link href="/create-workflow" className="hover:text-green-400 transition-colors">Create Workflow</Link></li>
                    <li><Link href="/analytics" className="hover:text-green-400 transition-colors">Analytics</Link></li>
                    <li><Link href="/community" className="hover:text-green-400 transition-colors">Community</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Resources</h4>
                  <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li><a href="#" className="hover:text-green-400 transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-green-400 transition-colors">API Reference</a></li>
                    <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-green-400 transition-colors">Community Forum</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Connect</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">🐦</a>
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">💬</a>
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">📧</a>
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">🔗</a>
                  </div>
                  <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Built for Forte Hacks 2025
                  </p>
                </div>
              </div>
              <div className={`border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} mt-8 pt-8 text-center`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  © 2025 FlowFi. All rights reserved. | Powered by Flow Blockchain & Forte
                </p>
          </div>
        </div>
            </MotionFooter>
          </Suspense>

      {/* Service Worker Registration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />

      {/* Performance and Analytics Scripts */}
      {process.env.NODE_ENV === 'production' && (
        <>
          {/* Vercel Analytics */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var script = document.createElement('script');
                  script.src = 'https://vercel.com/vitals';
                  script.defer = true;
                  document.head.appendChild(script);
                })();
              `,
            }}
          />
        </>
      )}
        </WalletProvider>
      </body>
    </html>
  );
}
