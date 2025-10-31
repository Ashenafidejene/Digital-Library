import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate, optionalAuth } from '../middleware';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/v1/dashboard/home-stats:
 *   get:
 *     summary: Get home page statistics (public)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Home page stats retrieved successfully
 */
router.get('/home-stats', dashboardController.getHomePageStats);

// All dashboard routes below require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', dashboardController.getOverview);

/**
 * @swagger
 * /api/v1/dashboard/charts:
 *   get:
 *     summary: Get dashboard charts data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/charts', dashboardController.getChartsData);

/**
 * @swagger
 * /api/v1/dashboard/borrowed-books:
 *   get:
 *     summary: Get borrowed books
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Borrowed books retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/borrowed-books', dashboardController.getBorrowedBooks);

/**
 * @swagger
 * /api/v1/dashboard/reserved-books:
 *   get:
 *     summary: Get reserved books
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reserved books retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/reserved-books', dashboardController.getReservedBooks);

/**
 * @swagger
 * /api/v1/dashboard/reading-history:
 *   get:
 *     summary: Get reading history
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reading history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/reading-history', dashboardController.getReadingHistory);

/**
 * @swagger
 * /api/v1/dashboard/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', dashboardController.getNotifications);

/**
 * @swagger
 * /api/v1/dashboard/favorite-books:
 *   get:
 *     summary: Get user's favorite books
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite books retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/favorite-books', dashboardController.getFavoriteBooks);

/**
 * @swagger
 * /api/v1/dashboard/send-reminder/{bookId}:
 *   post:
 *     summary: Send reminder for overdue book
 *     tags: [Dashboard]
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
 *         description: Reminder sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/send-reminder/:bookId', dashboardController.sendReminder);

/**
 * @swagger
 * /api/v1/dashboard/renew-book/{bookId}:
 *   post:
 *     summary: Renew book
 *     tags: [Dashboard]
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
 *         description: Book renewed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/renew-book/:bookId', dashboardController.renewBook);

/**
 * @swagger
 * /api/v1/dashboard/return-book/{bookId}:
 *   post:
 *     summary: Return book
 *     tags: [Dashboard]
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
 *         description: Book returned successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/return-book/:bookId', dashboardController.returnBook);

/**
 * @swagger
 * /api/v1/dashboard/cancel-reservation/{reservationId}:
 *   post:
 *     summary: Cancel reservation
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/cancel-reservation/:reservationId', dashboardController.cancelReservation);

/**
 * @swagger
 * /api/v1/dashboard/generate-report:
 *   get:
 *     summary: Generate a report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/generate-report', dashboardController.generateReport);

export default router;
