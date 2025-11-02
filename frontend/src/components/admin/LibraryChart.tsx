import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface LibraryChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
}

const LibraryChart: React.FC<LibraryChartProps> = ({ type, title }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/v1/dashboard/charts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
          if (type === 'line' && data.data.monthlyBookings) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const labels = data.data.monthlyBookings.map((item: any) => `${months[item._id.month - 1]} ${item._id.year}`);
            const borrowedData = data.data.monthlyBookings.map((item: any) => item.borrowed);
            const returnedData = data.data.monthlyBookings.map((item: any) => item.returned);
            
            setChartData({
              labels,
              datasets: [
                {
                  label: 'Books Borrowed',
                  data: borrowedData,
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                },
                {
                  label: 'Books Returned',
                  data: returnedData,
                  borderColor: 'rgb(16, 185, 129)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                }
              ]
            });
          } else if (type === 'bar' && data.data.monthlyNewMembers) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const labels = data.data.monthlyNewMembers.map((item: any) => `${months[item._id.month - 1]}`);
            const memberData = data.data.monthlyNewMembers.map((item: any) => item.count);
            
            setChartData({
              labels,
              datasets: [{
                label: 'New Members',
                data: memberData,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
              }]
            });
          } else if (type === 'doughnut') {
            // Fetch book stats from overview
            const overviewResponse = await fetch('/api/v1/dashboard/overview', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const overviewData = await overviewResponse.json();
            
            if (overviewData.success && overviewData.data.stats) {
              const stats = overviewData.data.stats;
              setChartData({
                labels: ['Borrowed', 'Available', 'Reserved'],
                datasets: [{
                  data: [stats.borrowedBooks, stats.totalBooks - stats.borrowedBooks - stats.reservedBooks, stats.reservedBooks],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                  ],
                }]
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    } : undefined,
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="spinner w-6 h-6"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      {type === 'line' && <Line data={chartData} options={options} />}
      {type === 'bar' && <Bar data={chartData} options={options} />}
      {type === 'doughnut' && <Doughnut data={chartData} options={options} />}
    </div>
  );
};

export default LibraryChart;
