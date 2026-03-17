import React from 'react';
import './Achievements.css';

const achievementsList = {
  first_habit: { icon: '🌱', color: '#4CAF50' },
  week_warrior: { icon: '🔥', color: '#FF9800' },
  month_master: { icon: '👑', color: '#FFD700' },
  century: { icon: '💯', color: '#f44336' }
};

const Achievements = ({ achievements = [] }) => {
  const hasAchievement = (type) => achievements.some(a => a.type === type);

  const allAchievements = [
    { type: 'first_habit', title: 'First Steps', description: 'Created your first habit' },
    { type: 'week_warrior', title: 'Week Warrior', description: 'Maintained a 7-day streak' },
    { type: 'month_master', title: 'Month Master', description: 'Maintained a 30-day streak' },
    { type: 'century', title: 'Century Club', description: 'Completed 100 habits' }
  ];

  return (
    <div className="achievements">
      <h3>🏆 Achievements</h3>
      <div className="achievements-grid">
        {allAchievements.map(achievement => {
          const earned = hasAchievement(achievement.type);
          const config = achievementsList[achievement.type];
          
          return (
            <div 
              key={achievement.type} 
              className={`achievement-card ${earned ? 'earned' : 'locked'}`}
              style={{ borderColor: earned ? config.color : '#ddd' }}
            >
              <div className="achievement-icon" style={{ backgroundColor: earned ? `${config.color}20` : '#f0f0f0' }}>
                {earned ? config.icon : '🔒'}
              </div>
              <div className="achievement-info">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                {earned && (
                  <span className="earned-date">
                    Earned: {new Date(achievements.find(a => a.type === achievement.type)?.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
