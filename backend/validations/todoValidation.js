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

const priorities = ['low', 'medium', 'high'];

// Create/Update todo validation
const todoValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1-200 characters'),
  
  body('priority')
    .optional()
    .isIn(priorities).withMessage(`Priority must be one of: ${priorities.join(', ')}`),
  
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters'),
  
  handleValidationErrors
];

// Todo ID param validation
const todoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid todo ID format'),
  handleValidationErrors
];

module.exports = {
  todoValidation,
  todoIdValidation,
  priorities
};
