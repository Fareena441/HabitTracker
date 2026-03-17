import React, { useState } from 'react';
import './HabitItem.css';
import { fireConfetti } from '../services/confetti';

const HabitItem = ({ habit, onToggle, onDelete, onArchive }) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const isCompletedToday = habit.isCompletedToday || false;

  const getCategoryIcon = (category) => {
    const icons = {
      health: '💊',
      fitness: '💪',
      productivity: '⚡',
      learning: '📚',
      mindfulness: '🧘',
      finance: '💰',
      other: '🎯'
    };
    return icons[category] || '🎯';
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '💪';
  };

  const handleToggle = () => {
    if (isCompletedToday) {
      onToggle(habit._id);
    } else {
      if (!habit.isCompletedToday) {
        fireConfetti();
      }
      setShowNoteInput(true);
    }
  };

  const handleSubmitNote = () => {
    onToggle(habit._id, note);
    fireConfetti();
    setNote('');
    setShowNoteInput(false);
  };

  const completionRate7 = habit.completionRate7Days || 0;
  const completionRate30 = habit.completionRate30Days || 0;

  return (
    <div className={`habit-item ${isCompletedToday ? 'completed' : ''} ${!habit.isActive ? 'archived' : ''}`}>
      <div className="habit-checkbox">
        <button
          className={`check-btn ${isCompletedToday ? 'checked' : ''}`}
          onClick={handleToggle}
          disabled={!habit.isActive}
        >
          {isCompletedToday && '✓'}
        </button>
      </div>
      
      <div className="habit-content">
        <div className="habit-main">
          <span className="habit-icon">{getCategoryIcon(habit.category)}</span>
          <div className="habit-info">
            <h4 className="habit-title">
              {habit.title}
              {!habit.isActive && <span className="archived-badge">Archived</span>}
            </h4>
            {habit.description && (
              <p className="habit-desc">{habit.description}</p>
            )}
            <div className="habit-stats">
              <span className="stat-badge" title="7-day completion rate">
                7d: {completionRate7}%
              </span>
              <span className="stat-badge" title="30-day completion rate">
                30d: {completionRate30}%
              </span>
              {habit.reminderTime && (
                <span className="reminder-badge">⏰ {habit.reminderTime}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="habit-meta">
          <div className="streak-badge">
            <span className="streak-emoji">{getStreakEmoji(habit.streak)}</span>
            <span className="streak-count">{habit.streak} days</span>
          </div>
          
          <div className="habit-actions">
            {onArchive && (
              <button 
                className="action-btn archive-btn" 
                onClick={() => onArchive(habit._id)}
                title={habit.isActive ? 'Archive habit' : 'Restore habit'}
              >
                {habit.isActive ? '📦' : '↩️'}
              </button>
            )}
            <button 
              className="action-btn delete-btn" 
              onClick={() => onDelete(habit._id)}
              title="Delete habit"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Note Input Modal */}
      {showNoteInput && (
        <div className="note-modal">
          <div className="note-modal-content">
            <h4>Add a note (optional)</h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it go?"
              maxLength={200}
            />
            <div className="note-actions">
              <button onClick={() => setShowNoteInput(false)}>Cancel</button>
              <button onClick={handleSubmitNote} className="submit-btn">Complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitItem;
