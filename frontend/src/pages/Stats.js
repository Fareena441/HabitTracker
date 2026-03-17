import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { habitAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import './Stats.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#60a5fa', '#f472b6'];

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await habitAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="stats-loading">Loading Analytics...</div>;
  if (error) return <div className="stats-error">{error}</div>;
  if (!stats) return null;

  // Prepare data for Pie Chart (Category Distribution)
  const categoryData = Object.keys(stats.categoryStats || {}).map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: stats.categoryStats[cat].count
  }));

  // Prepare data for Weekly Progress
  const weeklyData = stats.weekData || [];

  return (
    <div className="stats-page">
      <header className="stats-header">
        <h1>Advanced Analytics</h1>
        <p>Your progress at a glance</p>
      </header>

      <div className="stats-grid">
        <StatsCard
          title="Daily Progress"
          value={`${stats.combinedCompletionRate || 0}%`}
          icon="📈"
          color="var(--accent-primary)"
        />
        <StatsCard
          title="Monthly Consistency"
          value={`${stats.averageCompletionRate30Days}%`}
          icon="📅"
          color="#4CAF50"
        />
        <StatsCard
          title="All-Time Best Streak"
          value={stats.bestStreak}
          icon="🔥"
          color="#f44336"
        />
        <StatsCard
          title="Total Active Habits"
          value={stats.activeHabits}
          icon="📝"
          color="#FF9800"
        />
      </div>

      <div className="charts-container">
        {/* Weekly Activity Bar Chart */}
        <div className="chart-wrapper">
          <h3>Weekly Activity</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dayName" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar name="Completed" dataKey="completed" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar name="Total" dataKey="total" fill="var(--accent-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="chart-wrapper">
          <h3>Category Distribution</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Progress Area Chart */}
        <div className="chart-wrapper full-width">
          <h3>Monthly Progress Trend</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthData}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis />
                <Tooltip />
                <Area 
                   type="monotone" 
                   dataKey="completed" 
                   stroke="var(--accent-primary)" 
                   fillOpacity={1} 
                   fill="url(#colorComp)" 
                   name="Habits Completed"
                 />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
