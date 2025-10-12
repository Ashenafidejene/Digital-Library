import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import RecentActivity from './RecentActivity';

const DashboardOverview: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    borrowedToday: 0,
    overdueReturns: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    popularCategory: '',
    averageBorrowTime: '',
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: '1',
      type: 'newMember' as const,
      message: 'New member registered',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'bookBorrowed' as const,
      message: 'Book borrowed',
      user: 'Jane Smith',
      book: 'The Great Gatsby',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'bookReturned' as const,
      message: 'Book returned',
      user: 'Mike Johnson',
      book: 'To Kill a Mockingbird',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'bookAdded' as const,
      message: 'New book added',
      book: '1984 by George Orwell',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'overdueNotice' as const,
      message: 'Overdue notice sent',
      user: 'Sarah Wilson',
      book: 'Pride and Prejudice',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Mock data for charts
  const monthlyActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Books Borrowed',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Books Returned',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const categoryDistributionData = {
    labels: ['Fiction', 'Science', 'History', 'Biography', 'Children'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const borrowingTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'This Month',
        data: [12, 19, 15, 25],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'Last Month',
        data: [8, 15, 12, 20],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStats({
        totalBooks: 15420,
        totalMembers: 2847,
        borrowedToday: 156,
        overdueReturns: 23,
        activeMembers: 1892,
        newMembersThisMonth: 127,
        popularCategory: 'Fiction',
        averageBorrowTime: '12 days',
      });
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('admin.dashboard.stats.totalBooks')}
          value={stats.totalBooks}
          icon={BookOpenIcon}
          color="primary"
          loading={loading}
          change={{
            value: 5.2,
            type: 'increase',
            period: 'from last month',
          }}
        />
        <StatsCard
          title={t('admin.dashboard.stats.totalMembers')}
          value={stats.totalMembers}
          icon={UsersIcon}
          color="success"
          loading={loading}
          change={{
            value: 12.5,
            type: 'increase',
            period: 'from last month',
          }}
        />
        <StatsCard
          title={t('admin.dashboard.stats.borrowedToday')}
          value={stats.borrowedToday}
          icon={ClipboardDocumentListIcon}
          color="primary"
          loading={loading}
          change={{
            value: 8.1,
            type: 'increase',
            period: 'from yesterday',
          }}
        />
        <StatsCard
          title={t('admin.dashboard.stats.overdueReturns')}
          value={stats.overdueReturns}
          icon={ExclamationTriangleIcon}
          color="warning"
          loading={loading}
          change={{
            value: 2.3,
            type: 'decrease',
            period: 'from last week',
          }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('admin.dashboard.stats.activeMembers')}
          value={stats.activeMembers}
          icon={UserGroupIcon}
          color="success"
          loading={loading}
        />
        <StatsCard
          title={t('admin.dashboard.stats.newMembersThisMonth')}
          value={stats.newMembersThisMonth}
          icon={ArrowTrendingUpIcon}
          color="primary"
          loading={loading}
        />
        <StatsCard
          title={t('admin.dashboard.stats.popularCategory')}
          value={stats.popularCategory}
          icon={TagIcon}
          color="primary"
          loading={loading}
        />
        <StatsCard
          title={t('admin.dashboard.stats.averageBorrowTime')}
          value={stats.averageBorrowTime}
          icon={ClockIcon}
          color="primary"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('admin.dashboard.charts.monthlyActivity')}
          type="line"
          data={monthlyActivityData}
          loading={loading}
        />
        <ChartCard
          title={t('admin.dashboard.charts.categoryDistribution')}
          type="doughnut"
          data={categoryDistributionData}
          loading={loading}
          height={250}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title={t('admin.dashboard.charts.borrowingTrends')}
            type="bar"
            data={borrowingTrendsData}
            loading={loading}
            height={300}
          />
        </div>
        <div>
          <RecentActivity
            activities={recentActivities}
            loading={loading}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
