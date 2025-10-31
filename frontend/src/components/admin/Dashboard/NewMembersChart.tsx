import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface NewMembersChartProps {
  data: any[];
}

const NewMembersChart: React.FC<NewMembersChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    newMembers: item.count,
  }));

  console.log('NewMembersChart data:', chartData);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        New Members (Last 12 Months)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="newMembers" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NewMembersChart;
