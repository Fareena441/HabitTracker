const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/auth');
const { todoValidation, todoIdValidation } = require('../validations/todoValidation');

// Get todos with filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, completed, priority, category } = req.query;
    
    let query = { user: req.user.userId };
    
    // Date filtering
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = { $gte: targetDate, $lt: nextDay };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.date = { $gte: today, $lt: tomorrow };
    }
    
    // Other filters
    if (completed !== undefined) query.completed = completed === 'true';
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    const todos = await Todo.find(query).sort({ 
      createdAt: -1,
      priority: 1 // high, medium, low
    });
    
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new todo with validation
router.post('/', authMiddleware, todoValidation, async (req, res) => {
  try {
    const { title, priority, dueDate, category, isRecurring, recurrencePattern } = req.body;
    
    const todo = new Todo({
      user: req.user.userId,
      title,
      priority,
      dueDate,
      category,
      isRecurring,
      recurrencePattern
    });
    
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle todo completion
router.patch('/:id/toggle', authMiddleware, todoIdValidation, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
    await todo.save();
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update todo with validation
router.put('/:id', authMiddleware, todoIdValidation, todoValidation, async (req, res) => {
  try {
    const { title, priority, dueDate, category, isRecurring, recurrencePattern } = req.body;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, priority, dueDate, category, isRecurring, recurrencePattern },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete todo
router.delete('/:id', authMiddleware, todoIdValidation, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get todo stats
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Today's stats
    const todayTodos = await Todo.find({
      user: req.user.userId,
      date: { $gte: today, $lt: tomorrow }
    });
    
    const totalToday = todayTodos.length;
    const completedToday = todayTodos.filter(t => t.completed).length;
    
    // Priority breakdown
    const highPriority = todayTodos.filter(t => t.priority === 'high').length;
    const highPriorityCompleted = todayTodos.filter(t => t.priority === 'high' && t.completed).length;
    
    // Weekly completion trend
    const weekStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayTodos = await Todo.find({
        user: req.user.userId,
        date: { $gte: date, $lt: nextDay }
      });
      
      weekStats.push({
        date: date.toISOString().split('T')[0],
        total: dayTodos.length,
        completed: dayTodos.filter(t => t.completed).length
      });
    }
    
    // Overdue tasks
    const overdue = await Todo.find({
      user: req.user.userId,
      completed: false,
      dueDate: { $lt: today }
    }).countDocuments();
    
    res.json({
      today: {
        total: totalToday,
        completed: completedToday,
        pending: totalToday - completedToday,
        completionRate: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
      },
      priority: {
        high: { total: highPriority, completed: highPriorityCompleted },
        medium: { 
          total: todayTodos.filter(t => t.priority === 'medium').length,
          completed: todayTodos.filter(t => t.priority === 'medium' && t.completed).length
        },
        low: {
          total: todayTodos.filter(t => t.priority === 'low').length,
          completed: todayTodos.filter(t => t.priority === 'low' && t.completed).length
        }
      },
      weekStats,
      overdue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk complete todos
router.post('/bulk/complete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of todo IDs' });
    }
    
    const result = await Todo.updateMany(
      { _id: { $in: ids }, user: req.user.userId },
      { completed: true, completedAt: new Date() }
    );
    
    res.json({
      message: `${result.modifiedCount} todos marked as complete`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk delete todos
router.post('/bulk/delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of todo IDs' });
    }
    
    const result = await Todo.deleteMany(
      { _id: { $in: ids }, user: req.user.userId }
    );
    
    res.json({
      message: `${result.deletedCount} todos deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
