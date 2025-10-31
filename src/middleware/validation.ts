import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError, BookingStatus } from '../types';
import { UserRole, UserStatus } from '../types/enums';
import mongoose from 'mongoose';

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
  }
  
  next();
};

// Common validators
export const validateObjectId = (field: string) => {
  return param(field)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${field} format`);
      }
      return true;
    });
};

export const validateEmail = () => {
  return body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');
};

export const validatePassword = () => {
  return body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
};

export const validateName = () => {
  return body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces');
};

// User validation schemas
export const validateUserRegistration = [
  validateName(),
  validateEmail(),
  validatePassword(),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),
  handleValidationErrors,
];

export const validateUserLogin = [
  validateEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors,
];

// Book validation schemas
export const validateBookCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn([
      'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
      'Biography', 'Self-Help', 'Business', 'Health', 'Travel',
      'Cooking', 'Art', 'Music', 'Sports', 'Religion', 'Philosophy',
      'Psychology', 'Education', 'Children', 'Young Adult', 'Romance',
      'Mystery', 'Thriller', 'Horror', 'Fantasy', 'Science Fiction', 'Other'
    ])
    .withMessage('Invalid category'),
  body('isbn')
    .optional()
    .matches(/^(?:\d{9}[\dX]|\d{13})$/)
    .withMessage('Please provide a valid ISBN'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Code must be between 1 and 50 characters'),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language cannot exceed 50 characters'),
  body('pages')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Page count must be between 1 and 10000'),
  body('availability.totalCopies')
    .isInt({ min: 1 })
    .withMessage('Total copies must be at least 1'),
  body('location.shelf')
    .trim()
    .notEmpty()
    .withMessage('Shelf location is required'),
  body('location.section')
    .trim()
    .notEmpty()
    .withMessage('Section is required'),
  handleValidationErrors,
];

export const validateBookUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  handleValidationErrors,
];

// Booking validation schemas
export const validateBookingCreation = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid book ID format');
      }
      return true;
    }),
  body('borrowPeriodDays')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('Borrow period must be between 1 and 90 days'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors,
];

export const validateBookingUpdate = [
  body('status')
    .optional()
    .isIn(Object.values(BookingStatus))
    .withMessage('Invalid booking status'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters'),
  handleValidationErrors,
];

// Query validation schemas
export const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  handleValidationErrors,
];

export const validateSearchQuery = [
  ...validatePaginationQuery.slice(0, -1), // Remove handleValidationErrors
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string'),
  handleValidationErrors,
];
