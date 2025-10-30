import { motion, AnimatePresence } from 'framer-motion';
import { useToast, ToastType } from '@/lib/ToastContext';
import { useEffect } from 'react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: ToastType) => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg max-w-md";

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/10 border-green-400/30 text-green-400`;
      case 'error':
        return `${baseStyles} bg-red-500/10 border-red-400/30 text-red-400`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/10 border-yellow-400/30 text-yellow-400`;
      case 'info':
        return `${baseStyles} bg-blue-500/10 border-blue-400/30 text-blue-400`;
      default:
        return `${baseStyles} bg-gray-500/10 border-gray-400/30 text-gray-400`;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={getToastStyles(toast.type)}
          >
            <span className="text-xl flex-shrink-0">{getIcon(toast.type)}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.message && (
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeToast(toast.id)}
              className="text-xl opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label="Close notification"
            >
              ✕
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}