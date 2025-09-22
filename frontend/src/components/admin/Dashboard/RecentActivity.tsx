import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  BookOpenIcon,
  ArrowUturnLeftIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ActivityItem {
  id: string;
  type: 'newMember' | 'bookBorrowed' | 'bookReturned' | 'bookAdded' | 'overdueNotice';
  message: string;
  user?: string;
  book?: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  const { t } = useLanguage();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'newMember':
        return UserPlusIcon;
      case 'bookBorrowed':
        return BookOpenIcon;
      case 'bookReturned':
        return ArrowUturnLeftIcon;
      case 'bookAdded':
        return PlusIcon;
      case 'overdueNotice':
        return ExclamationTriangleIcon;
      default:
        return BookOpenIcon;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'newMember':
        return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20';
      case 'bookBorrowed':
        return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20';
      case 'bookReturned':
        return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20';
      case 'bookAdded':
        return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20';
      case 'overdueNotice':
        return 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20';
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (loading) {
    return (
      <div className="card">
        <div className="mb-4">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('admin.dashboard.recentActivity.title')}
        </h3>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClasses = getActivityColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    <span className="font-medium">
                      {t(`admin.dashboard.recentActivity.${activity.type}`)}
                    </span>
                    {activity.user && (
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {' '}by {activity.user}
                      </span>
                    )}
                    {activity.book && (
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {' '}- {activity.book}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
