import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  ClockIcon,
  HeartIcon,
  BellIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { BorrowedBook, ReservedBook, ReadingHistory, Notification } from '../../services/userDashboardService';

interface OverviewTabProps {
  borrowedBooks: BorrowedBook[];
  reservedBooks: ReservedBook[];
  readingHistory: ReadingHistory[];
  notifications: Notification[];
  favoriteBooksCount: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  borrowedBooks,
  reservedBooks,
  readingHistory,
  notifications,
  favoriteBooksCount,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'overdue':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'renewed':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'due_soon':
        return <ClockIcon className="w-5 h-5 text-warning-500" />;
      case 'overdue':
        return <ExclamationCircleIcon className="w-5 h-5 text-error-500" />;
      case 'available':
        return <CheckCircleIcon className="w-5 h-5 text-success-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-primary-500" />;
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="space-y-8"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {borrowedBooks.length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Borrowed Books
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {reservedBooks.length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Reserved Books
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
              <ArrowPathIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {readingHistory.length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Books Read
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-error-100 dark:bg-error-900/30 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-error-600 dark:text-error-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {favoriteBooksCount}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Favorite Books
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Books */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Current Books
          </h3>
          <div className="space-y-4">
            {borrowedBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="flex items-center space-x-4">
                <div className="w-12 h-16 bg-primary-100 dark:bg-primary-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {book.title.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {book.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    by {book.author}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(book.status)}`}>
                      {book.status === 'overdue' ? `Overdue` : `Due ${book.dueDate ? formatDate(book.dueDate) : ''}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {borrowedBooks.length === 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                No books currently borrowed
              </p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Recent Notifications
          </h3>
          <div className="space-y-4">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {notification.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {notification.message}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {formatDate(notification.date)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                No new notifications
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTab;
