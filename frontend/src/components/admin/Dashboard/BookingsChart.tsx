import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BookingsChartProps {
  data: any[];
}

const BookingsChart: React.FC<BookingsChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    borrowed: item.borrowed,
    returned: item.returned,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Bookings Overview (Last 12 Months)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="borrowed" fill="#8884d8" />
          <Bar dataKey="returned" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsChart;
