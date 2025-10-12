import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { DashboardOverview as DashboardOverviewType } from '../../services/dashboardService';
import DashboardCharts from './Dashboard/DashboardCharts';
import GenerateReport from './Dashboard/GenerateReport';

interface DashboardOverviewProps {
  overviewData: DashboardOverviewType | null;
  loading: boolean;
  onIssueBook: () => void;
  onShowAddBookModal: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  overviewData,
  loading,
  onIssueBook,
  onShowAddBookModal
}) => {
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner w-8 h-8 mr-4"></div>
        <span className="text-neutral-600 dark:text-neutral-400">Loading overview...</span>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">No overview data available</p>
      </div>
    );
  }

  const stats = [
  {
    title: 'Total Books',
    value: overviewData?.stats?.totalBooks ?? 0, // default 0
    icon: ChartBarIcon,
    color: 'bg-blue-500',
    change: '+12%'
  },
  {
    title: 'Active Members',
    value: overviewData?.stats?.totalMembers ?? 0, // default 0
    icon: UsersIcon,
    color: 'bg-green-500',
    change: '+8%'
  },
  {
    title: 'Books Borrowed',
    value: overviewData?.stats?.borrowedBooks ?? 0, // default 0
    icon: CheckCircleIcon,
    color: 'bg-yellow-500',
    change: '+15%'
  },
  {
    title: 'Overdue Books',
    value: overviewData?.stats?.overdueBooks ?? 0, // default 0
    icon: ExclamationTriangleIcon,
    color: 'bg-red-500',
    change: '-5%'
  }
];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Dashboard Overview
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={onIssueBook}
            className="btn-primary flex items-center space-x-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={() => setShowReportGenerator(!showReportGenerator)}
            className="btn-secondary flex items-center space-x-2"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {showReportGenerator && <GenerateReport />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {stat.title}
                  </p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {stat.value != null ? stat.value.toLocaleString() : 0}
                    </p>
                    {/* <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                      {stat.change}
                    </span> */}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {overviewData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-2 h-2 rounded-full
                  ${activity.type === 'borrow' ? 'bg-blue-500' : 
                    activity.type === 'return' ? 'bg-green-500' : 'bg-yellow-500'}
                `} />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {activity.user} {activity.type}ed "{activity.book}"
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
