import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon, ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-error-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center px-4">
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
          <div className="w-32 h-32 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-16 h-16 text-error-500 dark:text-error-400" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Access Denied
        </h2>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          You need to be logged in to access this page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="btn-primary inline-flex items-center justify-center">
            Login to Continue
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link to="/" className="btn-secondary inline-flex items-center justify-center">
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Don't have an account? <Link to="/register" className="font-medium hover:underline">Sign up here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
