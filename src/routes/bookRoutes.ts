import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import {
  authenticate,
  authorize,
  optionalAuth,
  validateBookCreation,
  validateBookUpdate,
  validatePaginationQuery,
  validateSearchQuery,
  validateObjectId,
  handleValidationErrors,
} from '../middleware';
import { UserRole } from '../types';

const router = Router();
const bookController = new BookController();

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Get all books with optional filtering
 *     tags: [Books]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, booked, maintenance]
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 */
router.get('/', optionalAuth, validateSearchQuery, bookController.getAllBooks);

/**
 * @swagger
 * /api/v1/books/available:
 *   get:
 *     summary: Get available books
 *     tags: [Books]
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
 *     responses:
 *       200:
 *         description: Available books retrieved successfully
 */
router.get('/available', validatePaginationQuery, bookController.getAvailableBooks);

/**
 * @swagger
 * /api/v1/books/popular:
 *   get:
 *     summary: Get popular books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Popular books retrieved successfully
 */
router.get('/popular', validatePaginationQuery, bookController.getPopularBooks);

/**
 * @swagger
 * /api/v1/books/recent:
 *   get:
 *     summary: Get recently added books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Recently added books retrieved successfully
 */
router.get('/recent', validatePaginationQuery, bookController.getRecentlyAddedBooks);

/**
 * @swagger
 * /api/v1/books/featured:
 *   get:
 *     summary: Get featured books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Featured books retrieved successfully
 */
router.get('/featured', bookController.getFeaturedBooks);

/**
 * @swagger
 * /api/v1/books/search:
 *   get:
 *     summary: Search books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book search completed successfully
 */
router.get('/search', validatePaginationQuery, bookController.searchBooks);

/**
 * @swagger
 * /api/v1/books/stats:
 *   get:
 *     summary: Get book statistics (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Book statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authenticate, authorize(UserRole.ADMIN), bookController.getBookStats);

/**
 * @swagger
 * /api/v1/books/categories:
 *   get:
 *     summary: Get all book categories
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', bookController.getCategories);

/**
 * @swagger
 * /api/v1/books/categories/stats:
 *   get:
 *     summary: Get category statistics (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/categories/stats', authenticate, authorize(UserRole.ADMIN), bookController.getCategoryStats);

/**
 * @swagger
 * /api/v1/books/category/{category}:
 *   get:
 *     summary: Get books by category
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Books in category retrieved successfully
 */
router.get('/category/:category', validatePaginationQuery, bookController.getBooksByCategory);

/**
 * @swagger
 * /api/v1/books/status/{status}:
 *   get:
 *     summary: Get books by status (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [available, booked, maintenance]
 *     responses:
 *       200:
 *         description: Books with status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/status/:status', authenticate, authorize(UserRole.ADMIN), validatePaginationQuery, bookController.getBooksByStatus);

/**
 * @swagger
 * /api/v1/books/isbn/{isbn}:
 *   get:
 *     summary: Get book by ISBN
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book retrieved by ISBN successfully
 *       404:
 *         description: Book not found
 */
router.get('/isbn/:isbn', bookController.getBookByISBN);

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Create a new book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - description
 *               - category
 *               - availability
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               isbn:
 *                 type: string
 *               availability:
 *                 type: object
 *                 properties:
 *                   totalCopies:
 *                     type: integer
 *                     minimum: 1
 *                   availableCopies:
 *                     type: integer
 *                     minimum: 0
 *               location:
 *                 type: object
 *                 properties:
 *                   shelf:
 *                     type: string
 *                   section:
 *                     type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(UserRole.ADMIN),validateBookCreation, bookController.createBook);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *       404:
 *         description: Book not found
 */
router.get('/:id', validateObjectId('id'), handleValidationErrors, bookController.getBookById);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     summary: Update book (Admin only)
 *     tags: [Books]
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
 *         description: Book updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Book not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  validateBookUpdate,
  bookController.updateBook
);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Delete book (Admin only)
 *     tags: [Books]
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
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Book not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  bookController.deleteBook
);

/**
 * @swagger
 * /api/v1/books/{id}/availability:
 *   get:
 *     summary: Check book availability
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book availability checked successfully
 *       404:
 *         description: Book not found
 */
router.get(
  '/:id/availability',
  validateObjectId('id'),
  handleValidationErrors,
  bookController.checkBookAvailability
);

/**
 * @swagger
 * /api/v1/books/{id}/status:
 *   put:
 *     summary: Update book status (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, booked, maintenance]
 *     responses:
 *       200:
 *         description: Book status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Book not found
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  bookController.updateBookStatus
);

export default router;
