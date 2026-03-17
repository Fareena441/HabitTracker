import React, { useState, useEffect } from 'react';
import { habitAPI } from '../services/api';
import './HabitTemplates.css';

const categoryIcons = {
  health: '💊',
  fitness: '💪',
  learning: '📚',
  mindfulness: '🧘',
  finance: '💰',
  productivity: '⚡',
  other: '🎯'
};

const HabitTemplates = ({ onSelect, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await habitAPI.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template) => {
    onSelect(template);
    onClose();
  };

  if (loading) {
    return <div className="templates-loading">Loading templates...</div>;
  }

  return (
    <div className="habit-templates-modal">
      <div className="templates-overlay" onClick={onClose}></div>
      <div className="templates-content">
        <div className="templates-header">
          <h2>Choose a Habit Template</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="templates-grid">
          {templates.map((template, index) => (
            <div 
              key={index} 
              className="template-card"
              onClick={() => handleSelect(template)}
              style={{ borderLeftColor: template.color }}
            >
              <div className="template-icon">{categoryIcons[template.category]}</div>
              <div className="template-info">
                <h4>{template.title}</h4>
                <span className="template-category">{template.category}</span>
                <span className="template-target">🎯 {template.targetDays} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitTemplates;
