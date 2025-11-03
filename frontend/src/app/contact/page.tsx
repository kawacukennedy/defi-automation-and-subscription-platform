'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/lib/ToastContext';
import Loading from '@/components/Loading';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

const categories = [
  'General Inquiry',
  'Technical Support',
  'Bug Report',
  'Feature Request',
  'Billing',
  'Partnership',
  'Other'
];

const faqs = [
  {
    question: 'How do I create my first workflow?',
    answer: 'Click on "Create Workflow" in the navigation, choose an action type, configure your settings, and deploy it to the blockchain.'
  },
  {
    question: 'What blockchains does FlowFi support?',
    answer: 'Currently, FlowFi supports the Flow blockchain with plans to expand to other networks in the future.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption and never store your private keys. All transactions are signed client-side.'
  },
  {
    question: 'How do I get support for a stuck transaction?',
    answer: 'Contact our support team with your transaction ID, and we\'ll help investigate and resolve the issue.'
  },
  {
    question: 'Can I cancel a scheduled workflow?',
    answer: 'Yes, you can pause or delete any workflow from your dashboard at any time.'
  }
];

export default function Contact() {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      success('Message Sent!', 'We\'ve received your message and will get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'medium'
      });
    } catch (err) {
      showError('Failed to send message', 'Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            Contact & Support
          </h1>
          <p className="text-gray-300 mt-2">Get help, report issues, or share your feedback</p>
        </div>
      </motion.header>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <label className="block mb-2 font-semibold">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <label className="block mb-2 font-semibold">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label className="block mb-2 font-semibold">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label className="block mb-2 font-semibold">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-green-400 focus:outline-none transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </motion.div>
                 </div>
               </form>
             </div>
           </motion.div>

           {/* FAQ Section */}
           <motion.div
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
           >
             <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-6">
               <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                 Frequently Asked Questions
               </h3>
               <div className="space-y-3">
                 {faqs.map((faq, index) => (
                   <div key={index} className="border-b border-white/10 last:border-b-0">
                     <button
                       onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                       className="w-full text-left py-3 px-2 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                     >
                       <div className="flex items-center justify-between">
                         <span className="font-medium">{faq.question}</span>
                         <span className={`transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}>
                           ▼
                         </span>
                       </div>
                     </button>
                     <AnimatePresence>
                       {activeFaq === index && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}
                           className="px-4 pb-4 text-gray-300 overflow-hidden"
                         >
                           {faq.answer}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 ))}
               </div>
             </div>

            {/* Status */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Flow Blockchain</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Services</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Workflow Engine</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}