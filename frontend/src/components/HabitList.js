import React from 'react';
import HabitItem from './HabitItem';
import './HabitList.css';

const HabitList = ({ habits, onToggle, onDelete, onArchive }) => {
  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No habits yet</h3>
        <p>Create your first habit to start tracking!</p>
      </div>
    );
  }

  // Sort: Active first, then by completion status
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.isActive ? -1 : 1;
  });

  return (
    <div className="habit-list">
      {sortedHabits.map(habit => (
        <HabitItem
          key={habit._id}
          habit={habit}
          onToggle={onToggle}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
};

export default HabitList;
