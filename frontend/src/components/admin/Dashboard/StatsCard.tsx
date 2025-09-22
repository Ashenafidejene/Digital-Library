import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  loading = false,
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      icon: 'text-primary-600 dark:text-primary-400',
      border: 'border-primary-200 dark:border-primary-800',
    },
    success: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      icon: 'text-success-600 dark:text-success-400',
      border: 'border-success-200 dark:border-success-800',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      icon: 'text-warning-600 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-800',
    },
    error: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      icon: 'text-error-600 dark:text-error-400',
      border: 'border-error-200 dark:border-error-800',
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        delay: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`card hover:shadow-medium transition-shadow duration-300 border ${colorClasses[color].border}`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <motion.div
            variants={iconVariants}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color].bg}`}
          >
            <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
          </motion.div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
      
      {change && (
        <div className="mt-4 flex items-center">
          <div className={`flex items-center ${
            change.type === 'increase' 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`}>
            {change.type === 'increase' ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(change.value)}%
            </span>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
            {change.period}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
