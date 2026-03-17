const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const categories = ['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'finance', 'other'];
const frequencies = ['daily', 'weekly', 'monthly'];

// Create/Update habit validation
const habitValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Habit title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(categories).withMessage(`Category must be one of: ${categories.join(', ')}`),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code (e.g., #FF5733)'),
  
  body('frequency')
    .optional()
    .isIn(frequencies).withMessage(`Frequency must be one of: ${frequencies.join(', ')}`),
  
  body('targetDays')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Target days must be between 1 and 365'),
  
  body('reminderTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Reminder time must be in HH:MM format'),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  
  handleValidationErrors
];

// Habit ID param validation
const habitIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid habit ID format'),
  handleValidationErrors
];

module.exports = {
  habitValidation,
  habitIdValidation,
  categories,
  frequencies
};
