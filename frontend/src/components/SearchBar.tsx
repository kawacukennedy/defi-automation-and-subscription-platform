import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search data - in a real app, this would come from an API
  const searchData: SearchResult[] = [
    { title: 'Dashboard', description: 'View your workflows and analytics', href: '/dashboard', category: 'Navigation' },
    { title: 'Create Workflow', description: 'Build automated DeFi workflows', href: '/create-workflow', category: 'Actions' },
    { title: 'Analytics', description: 'Track your workflow performance', href: '/analytics', category: 'Navigation' },
    { title: 'Community', description: 'Browse and share workflow templates', href: '/community', category: 'Navigation' },
    { title: 'Settings', description: 'Manage your account and preferences', href: '/settings', category: 'Navigation' },
    { title: 'Staking Workflow', description: 'Automate token staking rewards', href: '#', category: 'Templates' },
    { title: 'Recurring Payments', description: 'Schedule automatic crypto transfers', href: '#', category: 'Templates' },
    { title: 'Token Swaps', description: 'Automated DEX trading workflows', href: '#', category: 'Templates' },
    { title: 'Documentation', description: 'Learn how to use FlowFi', href: '/docs', category: 'Help' },
    { title: 'API Reference', description: 'Technical documentation for developers', href: '/api', category: 'Help' },
  ];

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 6)); // Limit to 6 results
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setResults([]);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Search"
      >
        🔍
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-96 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50"
          >
            <div className="p-4">
              <input
                type="text"
                placeholder="Search workflows, docs, settings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {results.length > 0 && (
              <div className="border-t border-white/10 max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <motion.div
                    key={`${result.href}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={result.href}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        setResults([]);
                      }}
                      className="block p-4 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{result.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{result.description}</p>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-3">
                          {result.category}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}