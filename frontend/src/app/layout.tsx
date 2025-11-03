'use client';

export const dynamic = 'force-dynamic';

// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/WalletContext";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import dynamicImport from 'next/dynamic';
import { motion } from 'framer-motion';
import ErrorBoundary from "@/components/ErrorBoundary";
import Loading from "@/components/Loading";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { ToastProvider } from "@/lib/ToastContext";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import ToastContainer from "@/components/ToastContainer";

// Lazy load heavy components
const MotionDiv = dynamicImport(() => import('framer-motion').then(mod => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <Loading size="sm" text="Loading..." />
});

const MotionNav = dynamicImport(() => import('framer-motion').then(mod => ({ default: mod.motion.nav })), {
  ssr: false,
  loading: () => <Loading size="md" text="Loading navigation..." />
});

const MotionFooter = dynamicImport(() => import('framer-motion').then(mod => ({ default: mod.motion.footer })), {
  ssr: false,
  loading: () => <Loading size="md" text="Loading footer..." />
});

const MotionButton = dynamicImport(() => import('framer-motion').then(mod => ({ default: mod.motion.button })), {
  ssr: false,
  loading: () => <Loading size="sm" />
});

const MotionSpan = dynamicImport(() => import('framer-motion').then(mod => ({ default: mod.motion.span })), {
  ssr: false,
  loading: () => <span></span>
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Workflow "Staking" executed successfully', time: '2 min ago', unread: true },
    { id: 2, message: 'New achievement unlocked: "Early Adopter"', time: '1 hour ago', unread: true },
    { id: 3, message: 'Community template forked by user', time: '3 hours ago', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <title>FlowFi - DeFi Automation & Subscription Platform</title>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="FlowFi" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FlowFi" />
        <meta name="description" content="Automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance on Flow blockchain" />
        <meta name="keywords" content="DeFi, Flow, Blockchain, Automation, Crypto, NFT, DAO, Web3" />
        <meta name="author" content="FlowFi Team" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="FlowFi - DeFi Automation & Subscription Platform" />
        <meta property="og:description" content="Automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance on Flow blockchain" />
        <meta property="og:url" content="https://flowfi.vercel.app" />
        <meta property="og:image" content="https://flowfi.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlowFi - DeFi Automation Platform" />
        <meta name="twitter:description" content="Automate your DeFi workflows on Flow blockchain with AI-powered insights" />
        <meta name="twitter:image" content="https://flowfi.vercel.app/og-image.png" />
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
       {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      <body
        className="antialiased transition-colors duration-300 bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white"
      >
        <ThemeProvider>
          <ToastProvider>
            <WalletProvider>
          {/* Navigation */}
          <Suspense fallback={<nav className="p-4 bg-gray-100 animate-pulse">Loading navigation...</nav>}>
            <MotionNav
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`backdrop-blur-md border-b ${
                theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/20 border-gray-200'
              } p-4 sticky top-0 z-50`}
            >
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                FlowFi
              </Link>
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex space-x-4">
                    <Link href="/dashboard" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</Link>
                    <Link href="/create-workflow" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create Workflow</Link>
                    <Link href="/analytics" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics</Link>
                    <Link href="/community" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Community</Link>
                    <Link href="/leaderboard" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leaderboard</Link>
                    <Link href="/settings" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</Link>
                    <Link href="/contact" className={`hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact</Link>
                </div>

                 {/* Search */}
                <SearchBar />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <MotionButton
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileMenuOpen}
                  >
                    <motion.div
                      animate={mobileMenuOpen ? 'open' : 'closed'}
                      className="w-6 h-5 relative"
                      aria-hidden="true"
                    >
                      <MotionSpan
                        variants={{
                          closed: { rotate: 0, y: 0 },
                          open: { rotate: 45, y: 8 }
                        }}
                        className="absolute top-0 left-0 w-6 h-0.5 bg-current block transform origin-center transition-all duration-300"
                      />
                      <MotionSpan
                        variants={{
                          closed: { opacity: 1 },
                          open: { opacity: 0 }
                        }}
                        className="absolute top-2 left-0 w-6 h-0.5 bg-current block transform origin-center transition-all duration-300"
                      />
                      <MotionSpan
                        variants={{
                          closed: { rotate: 0, y: 0 },
                          open: { rotate: -45, y: -8 }
                        }}
                        className="absolute top-4 left-0 w-6 h-0.5 bg-current block transform origin-center transition-all duration-300"
                      />
                    </motion.div>
                   </MotionButton>
                 </div>
               </div>
             </div>
            </MotionNav>
           </Suspense>

           {/* Mobile Menu Overlay */}
           {mobileMenuOpen && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
               onClick={() => setMobileMenuOpen(false)}
             />
           )}

           {/* Mobile Menu */}
           <motion.div
             initial={{ x: '100%' }}
             animate={{ x: mobileMenuOpen ? 0 : '100%' }}
             transition={{ type: 'tween', duration: 0.3 }}
             className="fixed top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-md border-l border-white/10 z-50 md:hidden"
           >
             <div className="p-6">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                   FlowFi
                 </h2>
                  <MotionButton
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-white/10"
                  >
                    ✕
                  </MotionButton>
               </div>
               <nav className="space-y-4">
                  {[
                    { href: '/dashboard', label: 'Dashboard' },
                    { href: '/create-workflow', label: 'Create Workflow' },
                    { href: '/analytics', label: 'Analytics' },
                    { href: '/community', label: 'Community' },
                    { href: '/leaderboard', label: 'Leaderboard' },
                    { href: '/settings', label: 'Settings' },
                    { href: '/contact', label: 'Contact' },
                  ].map((item) => (
                   <Link
                     key={item.href}
                     href={item.href}
                     onClick={() => setMobileMenuOpen(false)}
                      className={`block py-3 px-4 rounded-lg transition-colors ${
                        theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-black/10'
                      }`}
                   >
                     {item.label}
                   </Link>
                 ))}
               </nav>
                 <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Theme</span>
                     <ThemeToggle />
                   </div>
                 </div>
             </div>
           </motion.div>

           {/* Main Content */}
           <main id="main-content" className="min-h-screen">
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
                theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/20 border-gray-200'
              } py-12`}
            >
            <div className="container mx-auto px-4">
               <div className="grid md:grid-cols-5 gap-8">
                 <div className="md:col-span-2">
                   <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
                     FlowFi
                   </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                     Automating DeFi workflows on Flow blockchain with Forte Actions and AI-powered insights.
                   </p>
                   <div className="flex space-x-4">
                     <a href="https://twitter.com/flowfi" className="text-2xl hover:scale-110 transition-transform" aria-label="Twitter">🐦</a>
                     <a href="https://discord.gg/flowfi" className="text-2xl hover:scale-110 transition-transform" aria-label="Discord">💬</a>
                     <a href="mailto:hello@flowfi.com" className="text-2xl hover:scale-110 transition-transform" aria-label="Email">📧</a>
                     <a href="https://github.com/kawacukennedy/defi-automation-and-subscription-platform" className="text-2xl hover:scale-110 transition-transform" aria-label="GitHub">🔗</a>
                   </div>
                 </div>
                  <div>
                    <h4 className="font-semibold mb-4">Product</h4>
                    <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <li><Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link></li>
                      <li><Link href="/create-workflow" className="hover:text-green-400 transition-colors">Create Workflow</Link></li>
                      <li><Link href="/analytics" className="hover:text-green-400 transition-colors">Analytics</Link></li>
                      <li><Link href="/leaderboard" className="hover:text-green-400 transition-colors">Leaderboard</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Resources</h4>
                    <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <li><a href="/docs" className="hover:text-green-400 transition-colors">Documentation</a></li>
                      <li><a href="/api" className="hover:text-green-400 transition-colors">API Reference</a></li>
                      <li><a href="/help" className="hover:text-green-400 transition-colors">Help Center</a></li>
                      <li><Link href="/community" className="hover:text-green-400 transition-colors">Community Forum</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Company</h4>
                    <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <li><a href="/about" className="hover:text-green-400 transition-colors">About Us</a></li>
                      <li><a href="/blog" className="hover:text-green-400 transition-colors">Blog</a></li>
                      <li><a href="/careers" className="hover:text-green-400 transition-colors">Careers</a></li>
                      <li><Link href="/settings" className="hover:text-green-400 transition-colors">Settings</Link></li>
                    </ul>
                    <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Built for Forte Hacks 2025
                    </p>
                  </div>
               </div>
               <div className={`border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} mt-8 pt-8 text-center`}>
                 <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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
             <ToastContainer />
           </ToastProvider>
         </ThemeProvider>
       </body>
     </html>
   );
 }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
