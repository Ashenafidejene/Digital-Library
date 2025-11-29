import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WifiIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

const ConnectionErrorPage: React.FC = () => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-32 h-32 bg-warning-100 dark:bg-warning-900/20 rounded-full flex items-center justify-center">
            <WifiIcon className="w-16 h-16 text-warning-500 dark:text-warning-400" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Connection Lost
        </h2>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="btn-primary inline-flex items-center justify-center disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Retry Connection'}
          </button>
          
          <Link to="/" className="btn-secondary inline-flex items-center justify-center">
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>

        <div className="mt-12 p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Troubleshooting Tips:
          </h3>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 text-left">
            <li>• Check your internet connection</li>
            <li>• Refresh the page</li>
            <li>• Clear your browser cache</li>
            <li>• Try again in a few minutes</li>
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Still having issues? <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact support</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectionErrorPage;
