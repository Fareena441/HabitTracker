import React, { useState } from 'react';
import './HabitForm.css';

const HabitForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'other',
    color: initialData?.color || '#4CAF50',
    frequency: initialData?.frequency || 'daily',
    targetDays: initialData?.targetDays || 21,
    reminderTime: initialData?.reminderTime || '',
    ...initialData
  });

  const categories = [
    { value: 'health', label: 'Health', icon: '💊' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'productivity', label: 'Productivity', icon: '⚡' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'other', label: 'Other', icon: '🎯' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#f44336',
    '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    if (!initialData) {
      setFormData({
        title: '',
        description: '',
        category: 'other',
        color: '#4CAF50',
        frequency: 'daily',
        targetDays: 21,
        reminderTime: ''
      });
    }
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What habit do you want to track?"
          required
          className="habit-input"
          maxLength={100}
        />
      </div>
      
      <div className="form-row">
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description (optional)"
          className="habit-input"
          maxLength={500}
        />
      </div>
      
      <div className="form-row">
        <div className="category-select">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, category: cat.value })}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-row form-row-inline">
        <div className="form-group">
          <label>Frequency</label>
          <select 
            name="frequency" 
            value={formData.frequency} 
            onChange={handleChange}
            className="habit-select"
          >
            {frequencies.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Target (days)</label>
          <input
            type="number"
            name="targetDays"
            value={formData.targetDays}
            onChange={handleChange}
            min={1}
            max={365}
            className="habit-input-small"
          />
        </div>

        <div className="form-group">
          <label>Reminder</label>
          <input
            type="time"
            name="reminderTime"
            value={formData.reminderTime}
            onChange={handleChange}
            className="habit-input-small"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="color-select">
          <label>Color:</label>
          <div className="color-options">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                className={`color-btn ${formData.color === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </div>
        </div>
      </div>
      
      <button type="submit" className="submit-btn">
        {initialData ? 'Update Habit' : 'Create Habit'}
      </button>
    </form>
  );
};

export default HabitForm;
