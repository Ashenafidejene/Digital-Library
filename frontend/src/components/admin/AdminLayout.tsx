import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  SpeakerWaveIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage = 'dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Sidebar navigation - only dashboard
  const sidebarNavigation = [
    {
      name: t('navigation.dashboard'),
      href: '/admin',
      icon: HomeIcon,
      id: 'dashboard',
    },
    {
      name: t('admin.books.title'),
      href: '/admin/books',
      icon: BookOpenIcon,
      id: 'books',
    },
        {
      name: t('admin.users.title'),
      href: '/admin/users',
      icon: UsersIcon,
      id: 'users',
    },
    {
      name: t('admin.borrowing.title'),
      href: '/admin/borrowing',
      icon: ClipboardDocumentListIcon,
      id: 'borrowing',
    },
    {
      name: t('navigation.announcements'),
      href: '/admin/announcements',
      icon: SpeakerWaveIcon,
      id: 'announcements',
    },
    {
      name: t('navigation.events'),
      href: '/admin/events',
      icon: CalendarDaysIcon,
      id: 'events',
    },
    {
      name: t('navigation.settings'),
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      id: 'settings',
    },
  ];

  // Horizontal navigation - management functions

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('header.libraryName')}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Admin Panel</p>
              </div>
            </div>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {sidebarNavigation.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <item.icon
                    className={`${
                      isActive
                        ? 'text-primary-500'
                        : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 dark:group-hover:text-neutral-400'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Library Admin
                    </h1>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {sidebarNavigation.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                    >
                      <item.icon
                        className={`${
                          isActive
                            ? 'text-primary-500'
                            : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 dark:group-hover:text-neutral-400'
                        } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                      />
                      {item.name}
                    </a>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
          <button
            type="button"
            className="px-4 border-r border-neutral-200 dark:border-neutral-700 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                {t(`navigation.${currentPage}`)}
              </h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* Notifications */}
              <button className="p-2 rounded-full text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary-500"></span>
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Language toggle */}
              <LanguageToggle />

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center p-2 rounded-full text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200">
                  <UserCircleIcon className="h-8 w-8" />
                </button>
              </div>

              {/* Logout */}
              <button className="p-2 rounded-full text-neutral-400 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200">
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation */}


        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
