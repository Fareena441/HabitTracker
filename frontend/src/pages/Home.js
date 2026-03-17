import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="logo">Habit<span>Tracker</span></div>
        <div className="nav-links">
          <Link to="/login" className="login-link">Login</Link>
          <Link to="/register" className="register-btn">Get Started</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Master Your Habits, <br /><span>Transform Your Life.</span></h1>
          <p>
            Track your daily routines, reach your goals, and build a better you with 
            our powerful habit tracking and analytics platform.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="cta-primary">Start for Free</Link>
            <Link to="/login" className="cta-secondary">View Demo</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <strong>10k+</strong>
              <span>Active Users</span>
            </div>
            <div className="hero-stat-item">
              <strong>1M+</strong>
              <span>Habits Tracked</span>
            </div>
            <div className="hero-stat-item">
              <strong>95%</strong>
              <span>Success Rate</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          {/* We can put a mock dashboard screenshot or a cool illustration here */}
          <div className="mock-card card-1">
            <div className="mock-icon">🔥</div>
            <div className="mock-info">
              <span>Current Streak</span>
              <strong>15 Days</strong>
            </div>
          </div>
          <div className="mock-card card-2">
            <div className="mock-icon">📊</div>
            <div className="mock-info">
              <span>Goal Progress</span>
              <strong>85%</strong>
            </div>
          </div>
          <div className="mock-card card-3">
            <div className="mock-icon">✅</div>
            <div className="mock-info">
              <span>Completed Today</span>
              <strong>8 / 10</strong>
            </div>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="feature">
          <div className="feature-icon">📝</div>
          <h3>Easy Tracking</h3>
          <p>Log your habits with a single tap. Set reminders and never miss a beat.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📈</div>
          <h3>Deep Analytics</h3>
          <p>Visualize your progress with beautiful charts and data-driven insights.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🏆</div>
          <h3>Achievements</h3>
          <p>Stay motivated with streaks, badges, and rewards for your consistency.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2026 Habit Tracker Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
