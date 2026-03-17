const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Todo = require('../models/Todo');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { habitValidation, habitIdValidation } = require('../validations/habitValidation');

// Get all habits for logged in user with filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, isActive, search } = req.query;
    
    let query = { user: req.user.userId };
    
    // Apply filters
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const habits = await Habit.find(query).sort({ createdAt: -1 });
    
    // Add computed fields
    const habitsWithStats = habits.map(habit => ({
      ...habit.toObject(),
      isCompletedToday: habit.isCompletedToday(),
      completionRate7Days: habit.getCompletionRate(7),
      completionRate30Days: habit.getCompletionRate(30)
    }));
    
    res.json(habitsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new habit with validation
router.post('/', authMiddleware, habitValidation, async (req, res) => {
  try {
    const { title, description, category, color, frequency, targetDays, reminderTime, startDate } = req.body;
    
    const habit = new Habit({
      user: req.user.userId,
      title,
      description,
      category,
      color,
      frequency,
      targetDays,
      reminderTime,
      startDate
    });
    
    await habit.save();
    
    // Update user stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'stats.totalHabitsCreated': 1 }
    });
    
    // Check for first habit achievement
    const user = await User.findById(req.user.userId);
    if (user.stats.totalHabitsCreated === 1) {
      await user.addAchievement('first_habit', 'First Steps', 'Created your first habit');
    }
    
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update habit with validation
router.put('/:id', authMiddleware, habitIdValidation, habitValidation, async (req, res) => {
  try {
    const { title, description, category, color, frequency, targetDays, reminderTime, isActive } = req.body;
    
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, description, category, color, frequency, targetDays, reminderTime, isActive },
      { new: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete habit
router.delete('/:id', authMiddleware, habitIdValidation, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Archive/Unarchive habit
router.patch('/:id/archive', authMiddleware, habitIdValidation, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    habit.isActive = !habit.isActive;
    habit.archivedAt = habit.isActive ? null : new Date();
    await habit.save();
    
    res.json({
      message: habit.isActive ? 'Habit restored' : 'Habit archived',
      habit
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle habit completion for today with optional note
router.post('/:id/toggle', authMiddleware, habitIdValidation, async (req, res) => {
  try {
    const { note } = req.body;
    
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEntryIndex = habit.completedDates.findIndex(
      entry => new Date(entry.date).toDateString() === today.toDateString()
    );
    
    let wasCompleted = false;
    
    if (existingEntryIndex > -1) {
      const entry = habit.completedDates[existingEntryIndex];
      entry.completed = !entry.completed;
      wasCompleted = entry.completed;
      if (note !== undefined) entry.note = note;
    } else {
      habit.completedDates.push({ date: today, completed: true, note });
      wasCompleted = true;
    }
    
    habit.calculateStreak();
    await habit.save();
    
    // Update user stats if completed
    if (wasCompleted) {
      const user = await User.findById(req.user.userId);
      user.stats.totalHabitsCompleted += 1;
      
      if (habit.streak > user.stats.longestStreak) {
        user.stats.longestStreak = habit.streak;
      }
      
      await user.save();
      
      // Check achievements
      if (habit.streak === 7) {
        await user.addAchievement('week_warrior', 'Week Warrior', 'Maintained a 7-day streak');
      }
      if (habit.streak === 30) {
        await user.addAchievement('month_master', 'Month Master', 'Maintained a 30-day streak');
      }
      if (user.stats.totalHabitsCompleted === 100) {
        await user.addAchievement('century', 'Century Club', 'Completed 100 habits');
      }
    }
    
    res.json({
      ...habit.toObject(),
      isCompletedToday: habit.isCompletedToday()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add note to specific date
router.post('/:id/note', authMiddleware, habitIdValidation, async (req, res) => {
  try {
    const { date, note } = req.body;
    
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    
    const existingEntry = habit.completedDates.find(
      entry => new Date(entry.date).toDateString() === entryDate.toDateString()
    );
    
    if (existingEntry) {
      existingEntry.note = note;
    } else {
      habit.completedDates.push({ date: entryDate, completed: false, note });
    }
    
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get habit details with history
router.get('/:id', authMiddleware, habitIdValidation, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Get last 30 days history
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const entry = habit.completedDates.find(e => {
        const entryDate = new Date(e.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === date.getTime();
      });
      
      history.push({
        date: date.toISOString().split('T')[0],
        completed: entry ? entry.completed : false,
        note: entry ? entry.note : null
      });
    }
    
    res.json({
      ...habit.toObject(),
      history,
      isCompletedToday: habit.isCompletedToday(),
      completionRate7Days: habit.getCompletionRate(7),
      completionRate30Days: habit.getCompletionRate(30)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get habit statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.userId });
    
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const archivedHabits = totalHabits - activeHabits;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let completedToday = 0;
    let totalStreak = 0;
    let bestStreak = 0;
    let totalCompletionRate = 0;
    
    const categoryStats = {};
    
    habits.forEach(habit => {
      const todayEntry = habit.completedDates.find(
        entry => new Date(entry.date).toDateString() === today.toDateString() && entry.completed
      );
      if (todayEntry) completedToday++;
      totalStreak += habit.streak;
      if (habit.longestStreak > bestStreak) bestStreak = habit.longestStreak;
      
      const rate30 = habit.getCompletionRate(30);
      totalCompletionRate += rate30;
      
      // Category stats
      if (!categoryStats[habit.category]) {
        categoryStats[habit.category] = { count: 0, completed: 0 };
      }
      categoryStats[habit.category].count++;
      if (todayEntry) categoryStats[habit.category].completed++;
    });
    
    // Calculate weekly progress
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let completedCount = 0;
      habits.forEach(habit => {
        const entry = habit.completedDates.find(
          e => new Date(e.date).toDateString() === date.toDateString() && e.completed
        );
        if (entry) completedCount++;
      });
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedCount,
        total: activeHabits
      });
    }
    
    // Monthly data (last 30 days)
    const monthData = [];
    for (let i = 29; i >= 0; i -= 3) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let completedCount = 0;
      habits.forEach(habit => {
        for (let j = 0; j < 3 && (i - j) >= 0; j++) {
          const checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() - j);
          const entry = habit.completedDates.find(
            e => new Date(e.date).toDateString() === checkDate.toDateString() && e.completed
          );
          if (entry) completedCount++;
        }
      });
      
      monthData.push({
        date: date.toISOString().split('T')[0],
        completed: completedCount,
        total: activeHabits * Math.min(3, i + 1)
      });
    }

    // Combined Stats with Todos
    const todosToday = await Todo.find({
      user: req.user.userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
    });

    const totalTodosToday = todosToday.length;
    const completedTodosToday = todosToday.filter(t => t.completed).length;

    const totalItemsToday = activeHabits + totalTodosToday;
    const completedItemsToday = completedToday + completedTodosToday;
    
    res.json({
      totalHabits,
      activeHabits,
      archivedHabits,
      completedToday,
      totalTodosToday,
      completedTodosToday,
      combinedCompletionRate: totalItemsToday > 0 ? Math.round((completedItemsToday / totalItemsToday) * 100) : 0,
      completionRate: activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0,
      averageCompletionRate30Days: activeHabits > 0 ? Math.round(totalCompletionRate / activeHabits) : 0,
      totalStreak,
      bestStreak,
      averageStreak: activeHabits > 0 ? Math.round(totalStreak / activeHabits) : 0,
      categoryStats,
      weekData,
      monthData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get habit templates
router.get('/templates/list', authMiddleware, async (req, res) => {
  const templates = [
    { title: 'Drink 8 glasses of water', category: 'health', color: '#2196F3', targetDays: 30 },
    { title: 'Morning exercise', category: 'fitness', color: '#FF9800', targetDays: 21 },
    { title: 'Read 30 minutes', category: 'learning', color: '#9C27B0', targetDays: 30 },
    { title: 'Meditate', category: 'mindfulness', color: '#00BCD4', targetDays: 21 },
    { title: 'No sugar', category: 'health', color: '#4CAF50', targetDays: 30 },
    { title: 'Save money', category: 'finance', color: '#795548', targetDays: 90 },
    { title: 'Wake up early', category: 'productivity', color: '#f44336', targetDays: 21 },
    { title: 'Practice gratitude', category: 'mindfulness', color: '#FFEB3B', targetDays: 21 }
  ];
  
  res.json(templates);
});

module.exports = router;
