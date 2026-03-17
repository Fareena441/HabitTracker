const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'finance', 'other'],
    default: 'other'
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  targetDays: {
    type: Number,
    default: 21,
    min: 1,
    max: 365
  },
  reminderTime: {
    type: String, // Format: "HH:MM" in 24-hour format
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDates: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    },
    note: {
      type: String,
      maxlength: 200
    }
  }],
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
habitSchema.index({ user: 1, createdAt: -1 });
habitSchema.index({ user: 1, category: 1 });

// Method to calculate current streak
habitSchema.methods.calculateStreak = function() {
  const sortedDates = this.completedDates
    .filter(d => d.completed)
    .map(d => new Date(d.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b) - new Date(a));
  
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === currentStreak || (i === 0 && diffDays === 1)) {
      currentStreak++;
    } else if (diffDays > currentStreak) {
      break;
    }
  }
  
  this.streak = currentStreak;
  if (currentStreak > this.longestStreak) {
    this.longestStreak = currentStreak;
  }
  
  return currentStreak;
};

// Method to check if completed today
habitSchema.methods.isCompletedToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.completedDates.some(
    entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() && entry.completed;
    }
  );
};

// Method to get completion rate for last N days
habitSchema.methods.getCompletionRate = function(days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let completedCount = 0;
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const wasCompleted = this.completedDates.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === checkDate.getTime() && entry.completed;
    });
    
    if (wasCompleted) completedCount++;
  }
  
  return Math.round((completedCount / days) * 100);
};

module.exports = mongoose.model('Habit', habitSchema);
