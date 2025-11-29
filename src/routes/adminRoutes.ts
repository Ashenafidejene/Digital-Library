import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import * as eventController from '../controllers/EventController';
import {
  authenticate,
  authorize,
  validateObjectId,
  validatePaginationQuery,
  validateBookCreation,
  handleValidationErrors,
} from '../middleware';
import { upload } from '../middleware/upload';
import { UserRole } from '../types';
import { body } from 'express-validator';

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /api/v1/admin/activity:
 *   get:
 *     summary: Get system activity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System activity retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/activity', adminController.getSystemActivity);

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/health', adminController.getSystemHealth);

/**
 * @swagger
 * /api/v1/admin/audit-log:
 *   get:
 *     summary: Get audit log
 *     tags: [Admin]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/audit-log', validatePaginationQuery, adminController.getAuditLog);

// User Management Routes
/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', validatePaginationQuery, adminController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/promote:
 *   put:
 *     summary: Promote user to admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User promoted to admin successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/promote',
  validateObjectId('userId'),
  handleValidationErrors,
  adminController.promoteUserToAdmin
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/demote:
 *   put:
 *     summary: Demote admin to user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin demoted to user successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/demote',
  validateObjectId('userId'),
  handleValidationErrors,
  adminController.demoteAdminToUser
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/block:
 *   put:
 *     summary: Block user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/block',
  validateObjectId('userId'),
  handleValidationErrors,
  adminController.blockUser
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/unblock:
 *   put:
 *     summary: Unblock user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/unblock',
  validateObjectId('userId'),
  handleValidationErrors,
  adminController.unblockUser
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/borrowing-history:
 *   get:
 *     summary: Get user's borrowing history
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's borrowing history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.get(
  '/users/:userId/borrowing-history',
  validateObjectId('userId'),
  handleValidationErrors,
  adminController.getUserBorrowingHistory
);

/**
 * @swagger
 * /api/v1/admin/users/bulk-update:
 *   put:
 *     summary: Bulk update user status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - status
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, blocked, pending]
 *     responses:
 *       200:
 *         description: Users updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put(
  '/users/bulk-update',
  [
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('status').isIn(['active', 'blocked', 'pending']).withMessage('Invalid status'),
    handleValidationErrors,
  ],
  adminController.bulkUpdateUsers
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/reset-password:
 *   put:
 *     summary: Reset user password (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/reset-password',
  validateObjectId('userId'),
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
  ],
  adminController.resetUserPassword
);

// Borrowing Management
/**
 * @swagger
 * /api/v1/admin/borrowing:
 *   get:
 *     summary: Get all borrowing records
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Borrowing records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/borrowing', adminController.getBorrowingRecords);

/**
 * @swagger
 * /api/v1/admin/borrowing/{recordId}/approve:
 *   post:
 *     summary: Approve a borrowing request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrowing request approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Borrowing record not found
 */
router.post(
  '/borrowing/:recordId/approve',
  validateObjectId('recordId'),
  handleValidationErrors,
  adminController.approveBorrowingRequest
);

/**
 * @swagger
 * /api/v1/admin/borrowing/{recordId}/reject:
 *   post:
 *     summary: Reject a borrowing request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Borrowing request rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Borrowing record not found
 */
router.post(
  '/borrowing/:recordId/reject',
  validateObjectId('recordId'),
  [body('reason').notEmpty().withMessage('Rejection reason is required')],
  handleValidationErrors,
  adminController.rejectBorrowingRequest
);

/**
 * @swagger
 * /api/v1/admin/borrowing/{recordId}/return:
 *   post:
 *     summary: Mark a book as returned
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book marked as returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Borrowing record not found
 */
router.post(
  '/borrowing/:recordId/return',
  validateObjectId('recordId'),
  handleValidationErrors,
  adminController.returnBook
);

// Book Management Routes
/**
 * @swagger
 * /api/v1/admin/books:
 *   get:
 *     summary: Get all books (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/books', validatePaginationQuery, adminController.getAllBooks);

/**
 * @swagger
 * /api/v1/admin/books:
 *   post:
 *     summary: Create a new book (Admin only)
 *     tags: [Admin]
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
 *               publisher:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               pageCount:
 *                 type: integer
 *               language:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *               availability:
 *                 type: object
 *                 properties:
 *                   totalCopies:
 *                     type: integer
 *                   availableCopies:
 *                     type: integer
 *               location:
 *                 type: object
 *                 properties:
 *                   shelf:
 *                     type: string
 *                   section:
 *                     type: string
 *                   floor:
 *                     type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Book with ISBN already exists
 */
router.post('/books', validateBookCreation, adminController.createBook);

/**
 * @swagger
 * /api/v1/admin/books/{bookId}/status:
 *   put:
 *     summary: Update book status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
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
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Book not found
 */
router.put(
  '/books/:bookId/status',
  validateObjectId('bookId'),
  [
    body('status').isIn(['available', 'booked', 'maintenance']).withMessage('Invalid status'),
    handleValidationErrors,
  ],
  adminController.updateBookStatus
);

/**
 * @swagger
 * /api/v1/admin/books/bulk-update:
 *   put:
 *     summary: Bulk update book status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookIds
 *               - status
 *             properties:
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [available, booked, maintenance]
 *     responses:
 *       200:
 *         description: Books updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put(
  '/books/bulk-update',
  [
    body('bookIds').isArray().withMessage('Book IDs must be an array'),
    body('status').isIn(['available', 'booked', 'maintenance']).withMessage('Invalid status'),
    handleValidationErrors,
  ],
  adminController.bulkUpdateBooks
);

// Export Routes
/**
 * @swagger
 * /api/v1/admin/export/users:
 *   get:
 *     summary: Export user data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: User data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/export/users', adminController.exportUsers);

/**
 * @swagger
 * /api/v1/admin/export/books:
 *   get:
 *     summary: Export book data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Book data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/export/books', adminController.exportBooks);

// Event Management Routes
/**
 * @swagger
 * /api/v1/admin/events:
 *   get:
 *     summary: Get all events
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get('/events', eventController.getAllEvents);

/**
 * @swagger
 * /api/v1/admin/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/events', upload.single('image'), eventController.createEvent);

/**
 * @swagger
 * /api/v1/admin/events/{eventId}:
 *   put:
 *     summary: Update an event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.get('/events/:eventId', validateObjectId('eventId'), handleValidationErrors, eventController.getEventById);
router.put('/events/:eventId', validateObjectId('eventId'), upload.single('image'), handleValidationErrors, eventController.updateEvent);

/**
 * @swagger
 * /api/v1/admin/events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 */
router.delete('/events/:eventId', validateObjectId('eventId'), handleValidationErrors, eventController.deleteEvent);

// Announcement Management Routes
/**
 * @swagger
 * /api/v1/admin/announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 */
router.get('/announcements', adminController.getAnnouncements);

/**
 * @swagger
 * /api/v1/admin/announcements:
 *   post:
 *     summary: Create a new announcement
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */
router.post('/announcements', upload.single('image'), adminController.createAnnouncement);

/**
 * @swagger
 * /api/v1/admin/announcements/{announcementId}:
 *   put:
 *     summary: Update an announcement
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 */
router.put(
  '/announcements/:announcementId',
  validateObjectId('announcementId'),
  upload.single('image'),
  handleValidationErrors,
  adminController.updateAnnouncement
);

/**
 * @swagger
 * /api/v1/admin/announcements/{announcementId}:
 *   delete:
 *     summary: Delete an announcement
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 */
router.delete(
  '/announcements/:announcementId',
  validateObjectId('announcementId'),
  handleValidationErrors,
  adminController.deleteAnnouncement
);

/**
 * @swagger
 * /api/v1/admin/announcements/{announcementId}/status:
 *   put:
 *     summary: Toggle announcement status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Announcement status updated successfully
 */
router.put(
  '/announcements/:announcementId/status',
  validateObjectId('announcementId'),
  handleValidationErrors,
  adminController.toggleAnnouncementStatus
);

// Settings Routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
