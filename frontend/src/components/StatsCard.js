import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stats-info">
        <h3>{title}</h3>
        <p style={{ color }}>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
