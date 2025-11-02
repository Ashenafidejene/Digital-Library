import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, GlobeAltIcon, DocumentTextIcon, BellIcon, ServerIcon } from '@heroicons/react/24/outline';
import { getAdminSettings, updateAdminSettings } from '../../services/AdminSettingService';
import toast from 'react-hot-toast';

const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'borrowing' | 'notifications' | 'system'>('library');
  const [settings, setSettings] = useState({
    library: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    },
    borrowing: {
      maxBooksPerUser: 5,
      defaultBorrowPeriodDays: 14,
      maxRenewals: 2,
      finePerDay: 2.0
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      overdueReminders: true
    },
    system: {
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getAdminSettings();
      if (response.success && response.data) {
        const data = response.data as any;
        setSettings({
          library: data.library || settings.library,
          borrowing: data.borrowing || settings.borrowing,
          notifications: data.notifications || settings.notifications,
          system: data.system || settings.system
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await updateAdminSettings(settings);
      if (response.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'library' as const, name: 'Library Info', icon: GlobeAltIcon },
    { id: 'borrowing' as const, name: 'Borrowing Rules', icon: DocumentTextIcon },
    { id: 'notifications' as const, name: 'Notifications', icon: BellIcon },
    { id: 'system' as const, name: 'System', icon: ServerIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-neutral-600 dark:text-neutral-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Configure library system settings</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center">
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
      </div>

      {/* Tabs */}
      <div className="card">
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
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  } py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Library Settings */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Library Name</label>
                <input
                  type="text"
                  value={settings.library.name}
                  onChange={(e) => setSettings({ ...settings, library: { ...settings.library, name: e.target.value } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={settings.library.address}
                  onChange={(e) => setSettings({ ...settings, library: { ...settings.library, address: e.target.value } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={settings.library.phone}
                  onChange={(e) => setSettings({ ...settings, library: { ...settings.library, phone: e.target.value } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={settings.library.email}
                  onChange={(e) => setSettings({ ...settings, library: { ...settings.library, email: e.target.value } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="text"
                  value={settings.library.website}
                  onChange={(e) => setSettings({ ...settings, library: { ...settings.library, website: e.target.value } })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Borrowing Settings */}
          {activeTab === 'borrowing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Books Per User</label>
                <input
                  type="number"
                  value={settings.borrowing.maxBooksPerUser}
                  onChange={(e) => setSettings({ ...settings, borrowing: { ...settings.borrowing, maxBooksPerUser: parseInt(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Borrow Period (Days)</label>
                <input
                  type="number"
                  value={settings.borrowing.defaultBorrowPeriodDays}
                  onChange={(e) => setSettings({ ...settings, borrowing: { ...settings.borrowing, defaultBorrowPeriodDays: parseInt(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Renewals</label>
                <input
                  type="number"
                  value={settings.borrowing.maxRenewals}
                  onChange={(e) => setSettings({ ...settings, borrowing: { ...settings.borrowing, maxRenewals: parseInt(e.target.value) } })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fine Per Day</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.borrowing.finePerDay}
                  onChange={(e) => setSettings({ ...settings, borrowing: { ...settings.borrowing, finePerDay: parseFloat(e.target.value) } })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Email Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, emailNotifications: e.target.checked } })}
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">SMS Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, smsNotifications: e.target.checked } })}
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Overdue Reminders</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.overdueReminders}
                  onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, overdueReminders: e.target.checked } })}
                  className="toggle"
                />
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Maintenance Mode</label>
                <input
                  type="checkbox"
                  checked={settings.system.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, system: { ...settings.system, maintenanceMode: e.target.checked } })}
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Allow Registration</label>
                <input
                  type="checkbox"
                  checked={settings.system.allowRegistration}
                  onChange={(e) => setSettings({ ...settings, system: { ...settings.system, allowRegistration: e.target.checked } })}
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Require Email Verification</label>
                <input
                  type="checkbox"
                  checked={settings.system.requireEmailVerification}
                  onChange={(e) => setSettings({ ...settings, system: { ...settings.system, requireEmailVerification: e.target.checked } })}
                  className="toggle"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
