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
import {
  userDashboardService,
  BorrowedBook,
  ReservedBook,
  ReadingHistory,
  Notification,
} from '../../services/userDashboardService';
import { bookService } from '../../services/bookService';
import OverviewTab from '../../components/user/OverviewTab';
import BorrowedBooksTab from '../../components/user/BorrowedBooksTab';
import ReservedBooksTab from '../../components/user/ReservedBooksTab';
import ReadingHistoryTab from '../../components/user/ReadingHistoryTab';
import ProfileTab from '../../components/user/ProfileTab';
import BooksTab from '../../components/user/BooksTab';
import FavoriteBooksTab from '../../components/user/FavoriteBooksTab';
import { Book } from '../../services/bookService';

const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'borrowed' | 'reserved' | 'history' | 'profile' | 'books' | 'favorites'>('overview');
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const { data: borrowed } = await userDashboardService.getBorrowedBooks();
        const { data: reserved } = await userDashboardService.getReservedBooks();
        const { data: history } = await userDashboardService.getReadingHistory();
        const { data: notifications } = await userDashboardService.getNotifications();
        const { data: favoriteBooksDetails } = await userDashboardService.getFavoriteBooks();

        console.log('Dashboard Data:', { borrowed, reserved, history, notifications, favorites: favoriteBooksDetails });
        console.log('Borrowed books data:', borrowed);
        console.log('Reserved books data:', reserved);
        console.log('Reading history data:', history);
        console.log('Favorite books data:', favoriteBooksDetails);

        setBorrowedBooks(borrowed || []);
        setReservedBooks(reserved || []);
        setReadingHistory(history || []);
        setNotifications(notifications || []);
        setFavoriteBooks(favoriteBooksDetails || []);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
    const intervalId = setInterval(loadUserData, 180000000); // Poll every 30 minute
    return () => clearInterval(intervalId);
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

  const toggleFavorite = async (bookId: string) => {
    try {
      await userDashboardService.toggleFavorite(bookId);
      
      // Refetch favorite books to ensure the UI is in sync with the database
      const { data: favoriteBooksDetails } = await userDashboardService.getFavoriteBooks();
      setFavoriteBooks(favoriteBooksDetails || []);
    } catch (err) {
      console.error('Failed to toggle favorite status', err);
      // Optionally, show an error message to the user
    }
  };

  const renewBook = async (bookId: string) => {
    try {
      const response = await userDashboardService.renewBook(bookId);
      if (response.success) {
        // Refresh the borrowed books list to get the updated status
        const { data: borrowed } = await userDashboardService.getBorrowedBooks();
        setBorrowedBooks(borrowed || []);
      } else {
        console.error('Failed to renew book:', response.message);
        // Optionally, show an error message to the user
      }
    } catch (err) {
      console.error('An error occurred while renewing the book', err);
      // Optionally, show an error message to the user
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const response = await userDashboardService.cancelReservation(reservationId);
      if (response.success) {
        const reserved = await userDashboardService.getReservedBooks();
        setReservedBooks(reserved.data);
      } else {
        console.error('Failed to cancel reservation:', response.message);
      }
    } catch (err) {
      console.error('An error occurred while canceling the reservation', err);
    }
  };

  const rateBook = async (bookingId: string, rating: number) => {
    try {
      console.log('[UserDashboard] Rating book:', { bookingId, rating });
      const response = await userDashboardService.rateBook(bookingId, rating);
      console.log('[UserDashboard] Rate book response:', response);
      if (response.success) {
        const history = await userDashboardService.getReadingHistory();
        setReadingHistory(history.data);
        console.log('[UserDashboard] Reading history updated');
      } else {
        console.error('Failed to rate book:', response.message);
        alert('Failed to rate book: ' + response.message);
      }
    } catch (err: any) {
      console.error('An error occurred while rating the book', err);
      alert('Error rating book: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and User Info */}
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {t('header.libraryName')}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 truncate hidden sm:block">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            {/* Notifications and Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200">
                  <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 dark:text-neutral-400" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              
              <ThemeToggle />
              <LanguageToggle />
              <Link
                to="/events-announcements"
                className="btn-outline text-xs sm:text-sm hidden md:inline-flex"
              >
                Events & Announcements
              </Link>
              <Link
                to="/"
                className="btn-outline text-xs sm:text-sm px-2 sm:px-4"
              >
                <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <button
                onClick={logout}
                className="btn-primary text-xs sm:text-sm px-2 sm:px-4"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1 sm:mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Manage your library account, track your books, and discover new reads.
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
              <nav className="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'Overview', icon: BookOpenIcon },
                  { id: 'borrowed', label: 'Borrowed Books', icon: ClockIcon },
                  { id: 'reserved', label: 'Reserved Books', icon: CalendarDaysIcon },
                  { id: 'history', label: 'Reading History', icon: ArrowPathIcon },
                  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
                  { id: 'books', label: 'Books', icon: BookOpenIcon },
                  { id: 'favorites', label: 'Favorites', icon: HeartIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 bg-error-50 dark:bg-error-900/20 rounded-lg">
                <ExclamationCircleIcon className="w-12 h-12 text-error-500" />
                <p className="mt-4 text-lg font-semibold text-error-700 dark:text-error-300">
                  Something went wrong
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">{error}</p>
              </div>
            ) : (
              <div>
                {activeTab === 'overview' && (
                  <OverviewTab
                    borrowedBooks={borrowedBooks}
                    reservedBooks={reservedBooks}
                    readingHistory={readingHistory}
                    notifications={notifications}
                    favoriteBooksCount={favoriteBooks.length}
                  />
                )}
                {activeTab === 'borrowed' && (
                  <BorrowedBooksTab borrowedBooks={borrowedBooks} renewBook={renewBook} />
                )}
                {activeTab === 'reserved' && (
                  <ReservedBooksTab reservedBooks={reservedBooks} cancelReservation={cancelReservation} />
                )}
                {activeTab === 'history' && (
                  <ReadingHistoryTab readingHistory={readingHistory} rateBook={rateBook} />
                )}
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'books' && (
                  <BooksTab
                    favoriteBookIds={favoriteBooks.map(book => book.id)}
                    toggleFavorite={toggleFavorite}
                  />
                )}
                {activeTab === 'favorites' && (
                  <FavoriteBooksTab
                    favoriteBooks={favoriteBooks}
                    toggleFavorite={toggleFavorite}
                  />
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
