'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/lib/WalletContext';
import { useEffect, useState } from 'react';
import WalletConnectModal from '@/components/WalletConnectModal';

export default function Home() {
  const { connected, connectWallet } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testimonials = [
    { name: 'Alex Chen', role: 'DeFi Trader', content: 'FlowFi automated my staking rewards perfectly. Saved me hours every week!' },
    { name: 'Sarah Kim', role: 'DAO Contributor', content: 'The NFT achievements make contributing to DAOs so much more fun and rewarding.' },
    { name: 'Marcus Johnson', role: 'Crypto Investor', content: 'Recurring payments finally work reliably on blockchain. Game changer!' }
  ];

  const partners = ['Flow', 'Forte', 'QuickNode', 'Moonpay', 'Thirdweb'];

  if (!mounted) return null;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FlowFi",
            "description": "DeFi Automation & Subscription Platform on Flow blockchain",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "FlowFi Team"
            },
            "featureList": [
              "Automated recurring payments",
              "DeFi workflow automation",
              "NFT achievements and gamification",
              "Real-time analytics"
            ],
            "url": "https://flowfi.vercel.app",
            "sameAs": [
              "https://github.com/kawacukennedy/defi-automation-and-subscription-platform"
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white overflow-x-hidden">
      {/* Particle Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.1),transparent_50%)] animate-pulse"></div>
        <AnimatePresence>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full opacity-60"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              layout={false}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      <motion.section
        className="relative container mx-auto px-4 py-20 text-center min-h-screen flex items-center justify-center"
        style={{ y }}
      >
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
          >
            Automate Your DeFi Life
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Schedule recurring crypto payments, automate staking, swaps, and NFT rewards on Flow blockchain using Forte Actions and Workflows.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {connected ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,0,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  Go to Dashboard
                </motion.button>
              </Link>
             ) : (
               <motion.button
                 onClick={() => setWalletModalOpen(true)}
                 whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,0,0.5)' }}
                 whileTap={{ scale: 0.95 }}
                 className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
               >
                 Connect Wallet
               </motion.button>
             )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Watch Demo Video
            </motion.button>
          </motion.div>
        </div>

        {/* Animated Workflow Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 relative"
        >
          <div className="w-64 h-64 mx-auto bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-sm text-gray-400">Workflow Automation</p>
            </div>
          </div>
          {/* Floating elements */}
          {['💰', '🏦', '🎨', '🗳️'].map((icon, index) => (
            <motion.div
              key={icon}
              className="absolute text-2xl"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.sin(index) * 20, 0],
              }}
              transition={{
                duration: 2 + index * 0.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut",
              }}
              style={{
                left: `${20 + index * 20}%`,
                top: `${30 + index * 10}%`,
              }}
              layout={false}
            >
              {icon}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
        >
          Core Features
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '💰',
              title: 'Automated Recurring Payments',
              desc: 'Schedule FLOW, USDC, or partner token payments with retries and notifications.',
              color: 'from-green-400 to-green-600'
            },
            {
              icon: '⚡',
              title: 'DeFi Workflow Automation',
              desc: 'Create reusable workflows for staking, swapping, lending, and DAO governance.',
              color: 'from-blue-400 to-blue-600'
            },
            {
              icon: '🏆',
              title: 'NFT Achievements & Gamification',
              desc: 'Earn badges for milestones, compete on leaderboards, and share templates.',
              color: 'from-purple-400 to-purple-600'
            }
           ].map((feature, index) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
               viewport={{ once: true, margin: "-100px" }}
               whileHover={{
                 scale: 1.05,
                 boxShadow: '0 0 30px rgba(0,255,0,0.4)',
                 y: -5
               }}
               className={`bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all duration-500 bg-gradient-to-br ${feature.color} bg-opacity-10 cursor-pointer group`}
               layout={false}
             >
               <motion.div
                 className="text-5xl mb-4"
                 whileHover={{ scale: 1.1, rotate: 5 }}
                 transition={{ type: 'spring', stiffness: 400, damping: 10 }}
               >
                 {feature.icon}
               </motion.div>
               <motion.h3
                 className="text-2xl font-semibold mb-4 group-hover:text-green-300 transition-colors"
                 whileHover={{ x: 5 }}
               >
                 {feature.title}
               </motion.h3>
               <motion.p
                 className="text-gray-300 leading-relaxed"
                 whileHover={{ x: 3 }}
               >
                 {feature.desc}
               </motion.p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            See FlowFi in Action
          </h2>
          <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-gray-400">Demo Video Coming Soon</p>
              <p className="text-sm text-gray-500 mt-2">90-second pitch video for Forte Hacks 2025</p>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Watch how FlowFi transforms DeFi automation with AI-powered credit scoring, tokenized marketplaces,
            carbon credits, and real-time IoT data integration on the Flow blockchain.
          </p>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
        >
          What Users Say
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
           {testimonials.map((testimonial, index) => (
             <motion.div
               key={testimonial.name}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
               viewport={{ once: true, margin: "-50px" }}
               whileHover={{
                 scale: 1.03,
                 boxShadow: '0 0 25px rgba(0,255,0,0.2)',
                 y: -3
               }}
               className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-green-400/30 transition-all duration-300 group"
               layout={false}
             >
               <motion.div
                 className="flex items-center mb-4"
                 whileHover={{ x: 5 }}
               >
                 <motion.div
                   className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4"
                   whileHover={{ scale: 1.1, rotate: 10 }}
                   transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                 >
                   {testimonial.name.split(' ').map(n => n[0]).join('')}
                 </motion.div>
                 <div>
                   <motion.h4
                     className="font-semibold group-hover:text-green-300 transition-colors"
                     whileHover={{ x: 3 }}
                   >
                     {testimonial.name}
                   </motion.h4>
                   <motion.p
                     className="text-sm text-gray-400"
                     whileHover={{ x: 2 }}
                   >
                     {testimonial.role}
                   </motion.p>
                 </div>
               </motion.div>
               <motion.p
                 className="text-gray-300 italic group-hover:text-white transition-colors"
                 whileHover={{ x: 5 }}
               >
                 "{testimonial.content}"
               </motion.p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Partners/Media Logos */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-8 text-gray-300">Trusted by Leading Web3 Projects</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
             {partners.map((partner, index) => (
               <motion.div
                 key={partner}
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                 viewport={{ once: true }}
                 whileHover={{
                   scale: 1.05,
                   boxShadow: '0 0 15px rgba(255,255,255,0.2)',
                   y: -2
                 }}
                 className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group"
                 layout={false}
               >
                 <motion.span
                   className="font-semibold text-lg group-hover:text-green-300 transition-colors"
                   whileHover={{ scale: 1.05 }}
                 >
                   {partner}
                 </motion.span>
               </motion.div>
             ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 py-20 text-center"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Automate Your DeFi Journey?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of users automating their crypto workflows on Flow blockchain.
          </p>
          {connected ? (
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Launch Dashboard
              </motion.button>
            </Link>
           ) : (
             <motion.button
               onClick={() => setWalletModalOpen(true)}
               whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.3)' }}
               whileTap={{ scale: 0.95 }}
               className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
             >
               Connect Wallet & Start
             </motion.button>
           )}
        </div>
      </motion.section>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
    </>
  );
}
