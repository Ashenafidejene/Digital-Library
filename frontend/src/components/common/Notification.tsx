import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import {getSocket} from '../../services/socket'

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleNewNotification = (notification: Omit<Notification, 'id'>) => {
      setNotifications(prev => [...prev, { ...notification, id: Date.now().toString() }]);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success-100 border-success-500 text-success-800';
      case 'warning':
        return 'bg-warning-100 border-warning-500 text-warning-800';
      case 'error':
        return 'bg-error-100 border-error-500 text-error-800';
      default:
        return 'bg-info-100 border-info-500 text-info-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
      >
        <BellIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-error-500 border-2 border-white dark:border-neutral-800" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50"
          >
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">No new notifications</p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationStyles(notification.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{notification.message}</p>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-2 p-1 rounded-full hover:bg-black/10"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
