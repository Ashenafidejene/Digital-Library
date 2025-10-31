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
      {/* <pre>{JSON.stringify(overviewData, null, 2)}</pre> */}
    </div>
  );
};

export default DashboardOverview;
