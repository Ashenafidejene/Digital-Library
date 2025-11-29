import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import {
  authenticate,
  authorize,
  validateBookingCreation,
  validateBookingUpdate,
  validatePaginationQuery,
  validateObjectId,
  handleValidationErrors,
} from '../middleware';
import { UserRole } from '../types';
import { body } from 'express-validator';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking request
 *     tags: [Bookings]
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
 *               borrowPeriodDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 90
 *                 default: 14
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Booking request created successfully
 *       400:
 *         description: Validation error or book not available
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: User already has an active booking for this book
 */
router.post('/', validateBookingCreation, bookingController.createBooking);

/**
 * @swagger
 * /api/v1/bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
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
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', validatePaginationQuery, bookingController.getUserBookings);

/**
 * @swagger
 * /api/v1/bookings/my/history:
 *   get:
 *     summary: Get current user's booking history
 *     tags: [Bookings]
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
 *     responses:
 *       200:
 *         description: User booking history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my/history', validatePaginationQuery, bookingController.getUserBookingHistory);

/**
 * @swagger
 * /api/v1/bookings/stats:
 *   get:
 *     summary: Get booking statistics (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', authorize(UserRole.ADMIN), bookingController.getBookingStats);

/**
 * @swagger
 * /api/v1/bookings/pending:
 *   get:
 *     summary: Get pending bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/pending', authorize(UserRole.ADMIN), validatePaginationQuery, bookingController.getPendingBookings);

/**
 * @swagger
 * /api/v1/bookings/overdue:
 *   get:
 *     summary: Get overdue bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/overdue', authorize(UserRole.ADMIN), validatePaginationQuery, bookingController.getOverdueBookings);

/**
 * @swagger
 * /api/v1/bookings/due-soon:
 *   get:
 *     summary: Get bookings due soon (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 3
 *     responses:
 *       200:
 *         description: Bookings due soon retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/due-soon', authorize(UserRole.ADMIN), bookingController.getBookingsDueSoon);

/**
 * @swagger
 * /api/v1/bookings/popular-books:
 *   get:
 *     summary: Get popular books based on booking frequency
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popular books retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/popular-books', validatePaginationQuery, bookingController.getPopularBooks);

/**
 * @swagger
 * /api/v1/bookings/update-overdue:
 *   put:
 *     summary: Update overdue bookings status (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue bookings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/update-overdue', authorize(UserRole.ADMIN), bookingController.updateOverdueBookings);

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
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
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, returned, overdue]
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', authorize(UserRole.ADMIN), validatePaginationQuery, bookingController.getAllBookings);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
 *         description: Booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own bookings
 *       404:
 *         description: Booking not found
 */
router.get('/:id', validateObjectId('id'), handleValidationErrors, bookingController.getBookingById);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   put:
 *     summary: Update booking (Admin only)
 *     tags: [Bookings]
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
 *         description: Booking updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  validateBookingUpdate,
  bookingController.updateBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   delete:
 *     summary: Delete booking (Admin only)
 *     tags: [Bookings]
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
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Booking not found
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  bookingController.deleteBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}/approve:
 *   put:
 *     summary: Approve booking (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/approve',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  [
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
    handleValidationErrors,
  ],
  bookingController.approveBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}/reject:
 *   put:
 *     summary: Reject booking (Admin only)
 *     tags: [Bookings]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/reject',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  [
    body('reason').notEmpty().withMessage('Rejection reason is required')
      .isLength({ max: 1000 }).withMessage('Reason cannot exceed 1000 characters'),
    handleValidationErrors,
  ],
  bookingController.rejectBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}/return:
 *   put:
 *     summary: Return book (Admin only)
 *     tags: [Bookings]
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
 *         description: Book returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/return',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  bookingController.returnBook
);

/**
 * @swagger
 * /api/v1/bookings/{id}/renew:
 *   put:
 *     summary: Renew booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               additionalDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 30
 *     responses:
 *       200:
 *         description: Booking renewed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only renew own bookings
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/renew',
  validateObjectId('id'),
  [
    body('additionalDays').optional().isInt({ min: 1, max: 30 })
      .withMessage('Additional days must be between 1 and 30'),
    handleValidationErrors,
  ],
  bookingController.renewBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel booking (User can cancel own pending bookings)
 *     tags: [Bookings]
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
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only cancel own bookings
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/cancel',
  validateObjectId('id'),
  handleValidationErrors,
  bookingController.cancelBooking
);

/**
 * @swagger
 * /api/v1/bookings/{id}/rate:
 *   put:
 *     summary: Rate a returned book
 *     tags: [Bookings]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Book rated successfully
 *       400:
 *         description: Invalid rating or book not returned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only rate own bookings
 *       404:
 *         description: Booking not found
 */
router.put(
  '/:id/rate',
  validateObjectId('id'),
  [
    body('rating').notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    handleValidationErrors,
  ],
  bookingController.rateBooking
);

export default router;
