import { body, param } from 'express-validator';

export const createUrlValidator = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('Original URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    })
    .withMessage(
      'Original URL must be a valid HTTP or HTTPS URL'
    ),

  body('customAlias')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[a-zA-Z0-9_-]{3,50}$/)
    .withMessage(
      'Custom alias must contain 3-50 letters, numbers, underscores or hyphens'
    ),

  body('password')
    .optional({ values: 'falsy' })
    .isLength({ min: 4, max: 100 })
    .withMessage(
      'Password must be between 4 and 100 characters'
    ),

  body('expiresAt')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('expiresAt must be a valid date'),
];

export const idValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid URL ID'),
];

export const shortCodeValidator = [
  param('shortCode')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Invalid short code'),
];