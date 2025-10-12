import React from 'react';
import { motion } from 'framer-motion';
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

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options?: any;
  loading?: boolean;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  options = {},
  loading = false,
  height = 300,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    } : undefined,
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={defaultOptions} />;
      case 'bar':
        return <Bar data={data} options={defaultOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="mb-4">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse"></div>
        </div>
        <div 
          className="bg-neutral-100 dark:bg-neutral-700 rounded-lg animate-pulse"
          style={{ height: `${height}px` }}
        ></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="card"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
      </div>
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </motion.div>
  );
};

export default ChartCard;
