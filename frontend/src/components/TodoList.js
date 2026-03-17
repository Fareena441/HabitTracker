import React, { useState } from 'react';
import './TodoList.css';

const TodoList = ({ todos, onAdd, onToggle, onDelete }) => {
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    onAdd({ title: newTodo, priority });
    setNewTodo('');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#f44336',
      medium: '#FF9800',
      low: '#4CAF50'
    };
    return colors[priority] || '#999';
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="todo-list">
      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="add-todo-btn">+</button>
      </form>

      <div className="todo-progress">
        <span>{completedCount}/{todos.length} completed</span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      <div className="todos-container">
        {todos.length === 0 ? (
          <div className="empty-todos">
            <div className="empty-icon">📋</div>
            <p>No tasks for today. Add one above!</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <button
                className={`todo-check ${todo.completed ? 'checked' : ''}`}
                onClick={() => onToggle(todo._id)}
              >
                {todo.completed && '✓'}
              </button>
              
              <span className="todo-title">{todo.title}</span>
              
              <span 
                className="todo-priority"
                style={{ backgroundColor: `${getPriorityColor(todo.priority)}20`, color: getPriorityColor(todo.priority) }}
              >
                {todo.priority}
              </span>
              
              <button 
                className="todo-delete"
                onClick={() => onDelete(todo._id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
