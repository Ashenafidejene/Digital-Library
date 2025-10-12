import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { NotificationSettings } from '../../types/dashboard';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  avatar?: string;
}

interface ProfileTabProps {
  user: User | null;
  notifications: NotificationSettings;
  setNotifications: (settings: NotificationSettings) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  notifications,
  setNotifications
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the profile
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Profile Settings
      </h2>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center space-x-4 mb-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-10 h-10 text-neutral-400" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {user.name}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">{user.role}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Member since {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex space-x-3">
              <button onClick={handleSaveProfile} className="btn-primary">
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email:</span>
              <span className="ml-2 text-neutral-900 dark:text-neutral-100">{user.email}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">User ID:</span>
              <span className="ml-2 text-neutral-900 dark:text-neutral-100">{user.id}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary mt-4"
            >
              Edit Profile
            </button>
          </div>
        )}
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Email Notifications</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Receive email updates about library activities
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Overdue Alerts</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Get notified about overdue books
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications.overdueAlerts}
                onChange={() => handleNotificationChange('overdueAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Weekly Reports</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Receive weekly library activity summaries
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={() => handleNotificationChange('weeklyReports')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileTab;
