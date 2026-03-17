import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './ProgressChart.css';

const ProgressChart = ({ data }) => {
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formattedData = data.map(item => ({
    ...item,
    day: getDayName(item.date),
    percentage: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
  }));

  const getBarColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 50) return '#FF9800';
    return '#f44336';
  };

  return (
    <div className="progress-chart">
      <h3>Weekly Progress</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Completion']}
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#4CAF50' }}></span>
          <span>Excellent (80%+)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#FF9800' }}></span>
          <span>Good (50-79%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#f44336' }}></span>
          <span>Needs Work (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
