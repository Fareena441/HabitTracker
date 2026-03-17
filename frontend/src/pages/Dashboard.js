import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { habitAPI, todoAPI, authAPI } from '../services/api';
import HabitList from '../components/HabitList';
import HabitForm from '../components/HabitForm';
import TodoList from '../components/TodoList';
import ProgressChart from '../components/ProgressChart';
import StatsCard from '../components/StatsCard';
import Achievements from '../components/Achievements';
import HabitTemplates from '../components/HabitTemplates';
import Motivation from '../components/Motivation';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const [habits, setHabits] = useState([]);
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('habits');
  const [loading, setLoading] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchAchievements();
  }, [categoryFilter, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      const [habitsRes, todosRes, statsRes] = await Promise.all([
        habitAPI.getAll(filters),
        todoAPI.getAll({ search: searchTerm }),
        habitAPI.getStats()
      ]);
      setHabits(habitsRes.data);
      setTodos(todosRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await authAPI.getAchievements();
      setAchievements(response.data.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleAddHabit = async (habitData) => {
    try {
      const response = await habitAPI.create(habitData);
      setHabits([response.data, ...habits]);
      setShowHabitForm(false);
      fetchData();
      showNotification('New habit created!', 'success');
      fetchAchievements();
    } catch (error) {
      console.error('Error creating habit:', error);
      showNotification(error.response?.data?.message || 'Error creating habit', 'error');
    }
  };

  const handleToggleHabit = async (habitId, note = '') => {
    try {
      const response = await habitAPI.toggle(habitId, note);
      setHabits(habits.map(h => h._id === habitId ? response.data : h));
      fetchData();
      fetchAchievements();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await habitAPI.delete(habitId);
        setHabits(habits.filter(h => h._id !== habitId));
        showNotification('Habit deleted', 'info');
        fetchData();
      } catch (error) {
        console.error('Error deleting habit:', error);
        showNotification('Error deleting habit', 'error');
      }
    }
  };

  const handleArchiveHabit = async (habitId) => {
    try {
      const response = await habitAPI.archive(habitId);
      setHabits(habits.map(h => h._id === habitId ? response.data.habit : h));
      fetchData();
      showNotification(response.data.habit.isActive ? 'Habit restored' : 'Habit archived', 'success');
    } catch (error) {
      showNotification('Error updating habit', 'error');
    }
  };

  const handleAddTodo = async (todoData) => {
    try {
      const response = await todoAPI.create(todoData);
      setTodos([response.data, ...todos]);
      showNotification('Task added', 'success');
    } catch (error) {
      showNotification('Error adding task', 'error');
    }
  };

  const handleToggleTodo = async (todoId) => {
    try {
      const response = await todoAPI.toggle(todoId);
      setTodos(todos.map(t => t._id === todoId ? response.data : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await todoAPI.delete(todoId);
      setTodos(todos.filter(t => t._id !== todoId));
      showNotification('Task deleted', 'info');
    } catch (error) {
      showNotification('Error deleting task', 'error');
    }
  };

  const handleTemplateSelect = (template) => {
    handleAddHabit(template);
  };

  const categories = ['all', 'health', 'fitness', 'learning', 'mindfulness', 'finance', 'productivity', 'other'];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Habit Tracker</h1>
          <div className="user-info">
            <button 
              className="achievements-btn"
              onClick={() => setShowAchievements(!showAchievements)}
            >
              🏆 {achievements.length}
            </button>
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/stats" className="stats-link-btn">
              📊 Analytics
            </Link>
            <span>Welcome, {user?.username}!</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <Motivation />
        {/* Stats Section */}
        {stats && (
          <div className="stats-section">
            <StatsCard
              title="Total Habits"
              value={stats.activeHabits || stats.totalHabits}
              icon="📝"
              color="#667eea"
            />
            <StatsCard
              title="Completed Today"
              value={`${stats.completedToday}/${stats.activeHabits || stats.totalHabits}`}
              icon="✅"
              color="#4CAF50"
            />
            <StatsCard
              title="Daily Progress"
              value={`${stats.combinedCompletionRate || 0}%`}
              icon="📈"
              color="var(--accent-primary)"
            />
            <StatsCard
              title="Best Streak"
              value={stats.bestStreak}
              icon="🔥"
              color="#f44336"
            />
          </div>
        )}

        {/* Achievements Section */}
        {showAchievements && (
          <Achievements achievements={achievements} />
        )}

        {/* Progress Chart */}
        {stats?.weekData && (
          <div className="chart-section">
            <ProgressChart data={stats.weekData} />
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            My Habits
          </button>
          <button
            className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            Daily To-Do
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'habits' ? (
            <div className="habits-section">
              <div className="section-header">
                <h2>My Habits</h2>
                <div className="header-actions">
                  <div className="search-bar">
                    <input 
                      type="text" 
                      placeholder="Search habits..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  {/* Category Filter */}
                  <select 
                    className="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                  
                  <button
                    className="template-btn"
                    onClick={() => setShowTemplates(true)}
                  >
                    📋 Templates
                  </button>
                  
                  <button
                    className="add-btn"
                    onClick={() => setShowHabitForm(!showHabitForm)}
                  >
                    {showHabitForm ? 'Cancel' : '+ Add Habit'}
                  </button>
                </div>
              </div>
              
              {showHabitForm && (
                <HabitForm onSubmit={handleAddHabit} />
              )}
              
              <HabitList
                habits={habits}
                onToggle={handleToggleHabit}
                onDelete={handleDeleteHabit}
                onArchive={handleArchiveHabit}
              />
            </div>
          ) : (
            <div className="todos-section">
              <h2>Daily To-Do List</h2>
              <TodoList
                todos={todos}
                onAdd={handleAddTodo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            </div>
          )}
        </div>
      </main>

      {/* Habit Templates Modal */}
      {showTemplates && (
        <HabitTemplates 
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
