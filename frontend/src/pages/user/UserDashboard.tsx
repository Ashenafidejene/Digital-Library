import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  ClockIcon,
  HeartIcon,
  BellIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  StarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import LanguageToggle from '../../components/common/LanguageToggle';

// Mock data interfaces
interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  dueDate: string;
  status: 'borrowed' | 'overdue' | 'renewed';
  renewalsLeft: number;
  coverImage?: string;
}

interface ReservedBook {
  id: string;
  title: string;
  author: string;
  reservedDate: string;
  estimatedAvailability: string;
  position: number;
  coverImage?: string;
}

interface ReadingHistory {
  id: string;
  title: string;
  author: string;
  borrowedDate: string;
  returnedDate: string;
  rating?: number;
  coverImage?: string;
}

interface Notification {
  id: string;
  type: 'due_soon' | 'overdue' | 'available' | 'reminder' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'borrowed' | 'reserved' | 'history' | 'profile'>('overview');
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBorrowedBooks([
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          dueDate: '2024-02-20',
          status: 'borrowed',
          renewalsLeft: 2,
        },
        {
          id: '2',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          dueDate: '2024-02-15',
          status: 'overdue',
          renewalsLeft: 0,
        },
      ]);

      setReservedBooks([
        {
          id: '3',
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          reservedDate: '2024-02-10',
          estimatedAvailability: '2024-02-25',
          position: 2,
        },
      ]);

      setReadingHistory([
        {
          id: '4',
          title: '1984',
          author: 'George Orwell',
          borrowedDate: '2024-01-15',
          returnedDate: '2024-02-05',
          rating: 5,
        },
        {
          id: '5',
          title: 'Brave New World',
          author: 'Aldous Huxley',
          borrowedDate: '2024-01-01',
          returnedDate: '2024-01-20',
          rating: 4,
        },
      ]);

      setNotifications([
        {
          id: '1',
          type: 'due_soon',
          title: 'Book Due Soon',
          message: 'The Great Gatsby is due in 3 days',
          date: '2024-02-17',
          read: false,
        },
        {
          id: '2',
          type: 'overdue',
          title: 'Overdue Book',
          message: 'To Kill a Mockingbird is overdue',
          date: '2024-02-16',
          read: false,
        },
        {
          id: '3',
          type: 'available',
          title: 'Reserved Book Available',
          message: 'Pride and Prejudice will be available soon',
          date: '2024-02-15',
          read: true,
        },
      ]);

      setFavoriteBooks(new Set(['1', '4']));
      setLoading(false);
    };

    loadUserData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

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

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-neutral-300 dark:text-neutral-600'
        }`}
      />
    ));
  };

  const toggleFavorite = (bookId: string) => {
    setFavoriteBooks(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(bookId)) {
        newFavorites.delete(bookId);
      } else {
        newFavorites.add(bookId);
      }
      return newFavorites;
    });
  };

  const renewBook = (bookId: string) => {
    setBorrowedBooks(prev => 
      prev.map(book => 
        book.id === bookId 
          ? { ...book, renewalsLeft: book.renewalsLeft - 1, status: 'renewed' as const }
          : book
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and User Info */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('header.libraryName')}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            {/* Notifications and Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200">
                  <BellIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              
              <ThemeToggle />
              <LanguageToggle />
              <Link
                to="/"
                className="btn-outline text-sm"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <button
                onClick={logout}
                className="btn-primary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your library account, track your books, and discover new reads.
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BookOpenIcon },
                  { id: 'borrowed', label: 'Borrowed Books', icon: ClockIcon },
                  { id: 'reserved', label: 'Reserved Books', icon: CalendarDaysIcon },
                  { id: 'history', label: 'Reading History', icon: ArrowPathIcon },
                  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="spinner w-8 h-8 mr-4"></div>
                <span className="text-neutral-600 dark:text-neutral-400">Loading your dashboard...</span>
              </div>
            ) : (
              <div className="space-y-8">
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
                          {favoriteBooks.size}
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
                                {book.status === 'overdue' ? `Overdue` : `Due ${formatDate(book.dueDate)}`}
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
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
