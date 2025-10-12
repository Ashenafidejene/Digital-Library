import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../../services/dashboardService';
import BookingsChart from './BookingsChart';
import NewMembersChart from './NewMembersChart';


const DashboardCharts: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await dashboardService.getChartsData();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner w-8 h-8 mr-4"></div>
        <span className="text-neutral-600 dark:text-neutral-400">Loading charts...</span>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BookingsChart data={chartData.monthlyBookings} />
      <NewMembersChart data={chartData.monthlyNewMembers} />
    </div>
  );
};

export default DashboardCharts;
