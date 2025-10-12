import React from 'react';
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  ArrowPathRoundedSquareIcon,
  SpeakerWaveIcon,
  CalendarDaysIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { TabType } from '../../types/dashboard';

interface DashboardNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  activeTab,
  setActiveTab
}) => {
  const navItems = [
    { id: 'overview' as TabType, label: 'Dashboard', icon: HomeIcon },
    { id: 'books' as TabType, label: 'Manage Books', icon: BookOpenIcon },
    { id: 'users' as TabType, label: 'Manage Users', icon: UsersIcon },
    { id: 'borrowing' as TabType, label: 'Borrowing & Returns', icon: ArrowPathRoundedSquareIcon },
    { id: 'announcements' as TabType, label: 'Announcements', icon: SpeakerWaveIcon },
    { id: 'events' as TabType, label: 'Events', icon: CalendarDaysIcon },
    { id: 'settings' as TabType, label: 'Settings', icon: Cog6ToothIcon }
  ];

  return (
    <nav className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 min-h-screen p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex flex-col items-center space-y-2 p-4 rounded-lg font-medium text-sm transition-all duration-200
                ${activeTab === item.id
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700/50'
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardNavigation;
