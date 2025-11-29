import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center px-4">
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
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-primary-500 dark:text-primary-400">404</h1>
        </motion.div>

        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link to="/" className="btn-primary inline-flex items-center justify-center">
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <Link to="/books" className="btn-secondary inline-flex items-center justify-center">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            Browse Books
          </Link>
        </div>

        <div className="mt-12 p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Need help? <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact us</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
