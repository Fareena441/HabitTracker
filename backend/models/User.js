const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
    },
    avatar: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReport: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalHabitsCreated: { type: Number, default: 0 },
    totalHabitsCompleted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  achievements: [{
    type: {
      type: String,
      required: true
    },
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.stats.lastActive = new Date();
  return this.save();
};

// Add achievement
userSchema.methods.addAchievement = function(type, title, description) {
  const exists = this.achievements.some(a => a.type === type);
  if (!exists) {
    this.achievements.push({ type, title, description });
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
