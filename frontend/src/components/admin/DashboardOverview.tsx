import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  PlusIcon,
  BookOpenIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { DashboardOverview as DashboardOverviewType } from '../../services/dashboardService';
import LibraryChart from './LibraryChart';


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
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recommendation, setRecommendation] = useState({ title: '', description: '', priority: 'medium' });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch('/api/v1/dashboard/overview', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await response.json();
        setRecentActivity(data.data?.recentActivity || []);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchRecentActivity();
  }, []);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button onClick={onShowAddBookModal} className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base">
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add New Book</span>
          </button>
          <button onClick={() => setShowRecommendationForm(true)} className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base">
            <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Submit Recommendation</span>
          </button>
          <button onClick={async () => {
            try {
              const response = await fetch('/api/v1/dashboard/generate-report', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
              });
              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `library-report-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                alert('Report downloaded successfully!');
              } else {
                alert('Failed to generate report');
              }
            } catch (error) {
              alert('Error generating report');
            }
          }} className="btn-outline flex items-center justify-center space-x-2 text-sm sm:text-base">
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <LibraryChart type="line" title="Borrowing Trends (Last 6 Months)" />
        </div>
        <div className="card">
          <LibraryChart type="bar" title="Books by Category" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <LibraryChart type="doughnut" title="Book Status Distribution" />
        </div>
        <div className="card lg:col-span-2">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">Recent Activity</h3>
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-6 h-6"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'pending' ? 'bg-yellow-500' :
                    activity.type === 'rejected' ? 'bg-red-500' :
                    activity.type === 'approved' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{activity.user} - {activity.type}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{activity.book}</p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">{new Date(activity.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Recommendation Form Modal */}
      {showRecommendationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRecommendationForm(false)}>
          <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Submit Website Issue/Recommendation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Brief title of the issue or suggestion"
                  value={recommendation.title}
                  onChange={(e) => setRecommendation({...recommendation, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  placeholder="Describe the issue or suggestion in detail"
                  value={recommendation.description}
                  onChange={(e) => setRecommendation({...recommendation, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Priority</label>
                <select 
                  className="input-field"
                  value={recommendation.priority}
                  onChange={(e) => setRecommendation({...recommendation, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRecommendationForm(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={async () => {
                  try {
                    const response = await fetch('/api/v1/admin/recommendations', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                      },
                      body: JSON.stringify(recommendation)
                    });
                    if (response.ok) {
                      alert('Recommendation submitted successfully!');
                      setRecommendation({ title: '', description: '', priority: 'medium' });
                      setShowRecommendationForm(false);
                    }
                  } catch (error) {
                    alert('Failed to submit recommendation');
                  }
                }} className="btn-primary flex-1">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default DashboardOverview;
