import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

// Settings interfaces
interface LibrarySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  openingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

interface BorrowingSettings {
  maxBooksPerUser: number;
  defaultBorrowPeriodDays: number;
  maxRenewals: number;
  finePerDay: number;
  reservationPeriodDays: number;
  overdueNoticeDays: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  overdueReminders: boolean;
  reservationAlerts: boolean;
  eventNotifications: boolean;
  maintenanceAlerts: boolean;
}

interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  backupFrequencyHours: number;
}

const AdminSettingsPage: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'borrowing' | 'notifications' | 'system'>('library');
  const { t } = useLanguage();

  // Settings state
  const [librarySettings, setLibrarySettings] = useState<LibrarySettings>({
    name: 'Yeka Sub City Library',
    address: 'Yeka Sub City, Addis Ababa, Ethiopia',
    phone: '+251 11 123 4567',
    email: 'info@yekalibrary.gov.et',
    website: 'https://yekalibrary.gov.et',
    openingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false },
    },
  });

  const [borrowingSettings, setBorrowingSettings] = useState<BorrowingSettings>({
    maxBooksPerUser: 5,
    defaultBorrowPeriodDays: 14,
    maxRenewals: 2,
    finePerDay: 2.0,
    reservationPeriodDays: 7,
    overdueNoticeDays: 3,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    overdueReminders: true,
    reservationAlerts: true,
    eventNotifications: true,
    maintenanceAlerts: true,
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    backupFrequencyHours: 24,
  });

  /**
   * Fetch settings from backend
   * Includes backend URL validation
   */
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const url = 'http://localhost:3000/api/v1/admin/settings';
      
      // Validate backend availability
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch settings');
      }

      // Update settings state with fetched data
      if (data.data.library) setLibrarySettings(data.data.library);
      if (data.data.borrowing) setBorrowingSettings(data.data.borrowing);
      if (data.data.notifications) setNotificationSettings(data.data.notifications);
      if (data.data.system) setSystemSettings(data.data.system);
      
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          alert('Cannot connect to backend server. Please ensure the server is running on port 3000.');
        } else {
          alert(`Error fetching settings: ${error.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save settings to backend
   */
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const url = 'http://localhost:3000/api/v1/admin/settings';
      
      const settingsData = {
        library: librarySettings,
        borrowing: borrowingSettings,
        notifications: notificationSettings,
        system: systemSettings,
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        alert(t('messages.success.settingsSaved'));
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchSettings();
  }, []);

  // Tab configuration
  const tabs = [
    { id: 'library' as const, name: 'Library Info', icon: GlobeAltIcon },
    { id: 'borrowing' as const, name: 'Borrowing Rules', icon: DocumentTextIcon },
    { id: 'notifications' as const, name: 'Notifications', icon: BellIcon },
    { id: 'system' as const, name: 'System', icon: ServerIcon },
  ];

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-neutral-600 dark:text-neutral-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('navigation.settings')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Configure library system settings and preferences
          </p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          {saving ? (
            <>
              <div className="spinner w-4 h-4 mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="card">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Library Settings Tab */}
          {activeTab === 'library' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Library Name
                  </label>
                  <input
                    type="text"
                    value={librarySettings.name}
                    onChange={(e) => setLibrarySettings(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={librarySettings.email}
                    onChange={(e) => setLibrarySettings(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={librarySettings.phone}
                    onChange={(e) => setLibrarySettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={librarySettings.website}
                    onChange={(e) => setLibrarySettings(prev => ({ ...prev, website: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Address
                </label>
                <textarea
                  value={librarySettings.address}
                  onChange={(e) => setLibrarySettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="input-field"
                />
              </div>
            </motion.div>
          )}

          {/* Borrowing Settings Tab */}
          {activeTab === 'borrowing' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Max Books Per User
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={borrowingSettings.maxBooksPerUser}
                    onChange={(e) => setBorrowingSettings(prev => ({ ...prev, maxBooksPerUser: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Default Borrow Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={borrowingSettings.defaultBorrowPeriodDays}
                    onChange={(e) => setBorrowingSettings(prev => ({ ...prev, defaultBorrowPeriodDays: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Max Renewals
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={borrowingSettings.maxRenewals}
                    onChange={(e) => setBorrowingSettings(prev => ({ ...prev, maxRenewals: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Fine Per Day (ETB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={borrowingSettings.finePerDay}
                    onChange={(e) => setBorrowingSettings(prev => ({ ...prev, finePerDay: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Reservation Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={borrowingSettings.reservationPeriodDays}
                    onChange={(e) => setBorrowingSettings(prev => ({ ...prev, reservationPeriodDays: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Overdue Notice (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={borrowingSettings.overdueNoticeDays}
                    onChange={(e) => setBorrowingSettings(prev => ({ ...prev, overdueNoticeDays: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === 'notifications' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {key === 'emailNotifications' && 'Send notifications via email'}
                        {key === 'smsNotifications' && 'Send notifications via SMS'}
                        {key === 'overdueReminders' && 'Send reminders for overdue books'}
                        {key === 'reservationAlerts' && 'Send alerts for book reservations'}
                        {key === 'eventNotifications' && 'Send notifications for library events'}
                        {key === 'maintenanceAlerts' && 'Send alerts for system maintenance'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="space-y-4">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Maintenance Mode
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Temporarily disable public access to the system
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warning-300 dark:peer-focus:ring-warning-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-warning-600"></div>
                  </label>
                </div>

                {/* Other System Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Session Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={systemSettings.sessionTimeoutMinutes}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeoutMinutes: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Backup Frequency (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={systemSettings.backupFrequencyHours}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequencyHours: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Boolean Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Allow Registration
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.allowRegistration}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Require Email Verification
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Require users to verify their email addresses
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.requireEmailVerification}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminSettingsPage;
