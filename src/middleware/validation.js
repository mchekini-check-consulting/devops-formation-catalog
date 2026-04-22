const { body, query } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be at most 255 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 255 }).withMessage('Name must be at most 255 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty'),
];

const searchProductValidation = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  searchProductValidation,
};
