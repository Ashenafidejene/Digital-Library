import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import {
  authenticate,
  authorize,
  validateUserUpdate,
  validatePaginationQuery,
  validateObjectId,
  handleValidationErrors,
} from '../middleware';
import { UserRole } from '../types';
import { body } from 'express-validator';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', validateUserUpdate, userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               smsNotifications:
 *                 type: boolean
 *               favoriteCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/preferences',
  [
    body('emailNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('favoriteCategories').optional().isArray(),
    handleValidationErrors,
  ],
  userController.updatePreferences
);

/**
 * @swagger
 * /api/v1/users/favorites/categories:
 *   post:
 *     summary: Add favorite category
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *             properties:
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite category added successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/favorites/categories',
  [body('category').notEmpty().withMessage('Category is required'), handleValidationErrors],
  userController.addFavoriteCategory
);

/**
 * @swagger
 * /api/v1/users/favorites/categories/{category}:
 *   delete:
 *     summary: Remove favorite category
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite category removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/favorites/categories/:category', userController.removeFavoriteCategory);

/**
 * @swagger
 * /api/v1/users/favorites:
 *   get:
 *     summary: Get favorite books
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite books retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites', userController.getFavoriteBooks);

/**
 * @swagger
 * /api/v1/users/favorites:
 *   post:
 *     summary: Add a book to favorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book added to favorites successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/favorites',
  [body('bookId').notEmpty().withMessage('Book ID is required'), handleValidationErrors],
  userController.addFavoriteBook
);

/**
 * @swagger
 * /api/v1/users/favorites/{bookId}:
 *   delete:
 *     summary: Remove a book from favorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book removed from favorites successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/favorites/:bookId', userController.removeFavoriteBook);

/**
 * @swagger
 * /api/v1/users/books/{bookId}/favorite:
 *   post:
 *     summary: Toggle a book's favorite status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/books/:bookId/favorite',
  [validateObjectId('bookId'), handleValidationErrors],
  userController.toggleFavoriteBook
);

// Admin-only routes
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, blocked, pending]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize(UserRole.ADMIN), validatePaginationQuery, userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Search users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users search completed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/search', authorize(UserRole.ADMIN), validatePaginationQuery, userController.searchUsers);

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authorize(UserRole.ADMIN), userController.getUserStats);

/**
 * @swagger
 * /api/v1/users/role/{role}:
 *   get:
 *     summary: Get users by role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/role/:role', authorize(UserRole.ADMIN), validatePaginationQuery, userController.getUsersByRole);

/**
 * @swagger
 * /api/v1/users/status/{status}:
 *   get:
 *     summary: Get users by status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, blocked, pending]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/status/:status', authorize(UserRole.ADMIN), validatePaginationQuery, userController.getUsersByStatus);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', validateObjectId('id'), handleValidationErrors, userController.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  validateUserUpdate,
  userController.updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  userController.deleteUser
);

/**
 * @swagger
 * /api/v1/users/{id}/block:
 *   put:
 *     summary: Block user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/block',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  userController.blockUser
);

/**
 * @swagger
 * /api/v1/users/{id}/unblock:
 *   put:
 *     summary: Unblock user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/unblock',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  userController.unblockUser
);

export default router;
