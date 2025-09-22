import { Router } from 'express';
import { SocketController } from '../controllers/SocketController';
import {
  authenticate,
  authorize,
  validateObjectId,
  handleValidationErrors,
} from '../middleware';
import { UserRole } from '../types';
import { body } from 'express-validator';

const router = Router();
const socketController = new SocketController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/socket/status:
 *   get:
 *     summary: Get Socket.IO connection status
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/status', socketController.getConnectionStatus);

/**
 * @swagger
 * /api/v1/socket/events:
 *   get:
 *     summary: Get list of available Socket.IO events
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Socket events list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/events', socketController.getSocketEvents);

/**
 * @swagger
 * /api/v1/socket/user/{userId}/connection:
 *   get:
 *     summary: Check if a specific user is connected (Admin only)
 *     tags: [Socket.IO]
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
 *         description: User connection status checked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  '/user/:userId/connection',
  authorize(UserRole.ADMIN),
  validateObjectId('userId'),
  handleValidationErrors,
  socketController.checkUserConnection
);

// Admin-only routes
/**
 * @swagger
 * /api/v1/socket/notification/system:
 *   post:
 *     summary: Send system notification (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, error]
 *                 default: info
 *               targetUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: System notification sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/notification/system',
  authorize(UserRole.ADMIN),
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['info', 'warning', 'error']).withMessage('Invalid notification type'),
    body('targetUsers').optional().isArray().withMessage('Target users must be an array'),
    handleValidationErrors,
  ],
  socketController.sendSystemNotification
);

/**
 * @swagger
 * /api/v1/socket/notification/maintenance:
 *   post:
 *     summary: Send maintenance notification (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Maintenance notification sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/notification/maintenance',
  authorize(UserRole.ADMIN),
  [
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
    handleValidationErrors,
  ],
  socketController.sendMaintenanceNotification
);

/**
 * @swagger
 * /api/v1/socket/notification/emergency:
 *   post:
 *     summary: Send emergency notification (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Emergency notification sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/notification/emergency',
  authorize(UserRole.ADMIN),
  [
    body('message').notEmpty().withMessage('Emergency message is required'),
    handleValidationErrors,
  ],
  socketController.sendEmergencyNotification
);

/**
 * @swagger
 * /api/v1/socket/message/direct/{userId}:
 *   post:
 *     summary: Send direct message to user (Admin only)
 *     tags: [Socket.IO]
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 default: message
 *     responses:
 *       200:
 *         description: Direct message sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/message/direct/:userId',
  authorize(UserRole.ADMIN),
  validateObjectId('userId'),
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isString().withMessage('Type must be a string'),
    handleValidationErrors,
  ],
  socketController.sendDirectMessage
);

/**
 * @swagger
 * /api/v1/socket/broadcast/admins:
 *   post:
 *     summary: Broadcast message to all admins (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - data
 *             properties:
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Message broadcasted to admins successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/broadcast/admins',
  authorize(UserRole.ADMIN),
  [
    body('event').notEmpty().withMessage('Event is required'),
    body('data').notEmpty().withMessage('Data is required'),
    handleValidationErrors,
  ],
  socketController.broadcastToAdmins
);

/**
 * @swagger
 * /api/v1/socket/broadcast/statistics:
 *   post:
 *     summary: Broadcast statistics to admins (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stats
 *             properties:
 *               stats:
 *                 type: object
 *     responses:
 *       200:
 *         description: Statistics broadcasted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/broadcast/statistics',
  authorize(UserRole.ADMIN),
  [
    body('stats').notEmpty().withMessage('Statistics data is required'),
    handleValidationErrors,
  ],
  socketController.broadcastStatistics
);

/**
 * @swagger
 * /api/v1/socket/reminders/bookings:
 *   post:
 *     summary: Send booking reminders (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking reminders sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/reminders/bookings',
  authorize(UserRole.ADMIN),
  socketController.sendBookingReminders
);

/**
 * @swagger
 * /api/v1/socket/notifications/overdue:
 *   post:
 *     summary: Send overdue notifications (Admin only)
 *     tags: [Socket.IO]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue notifications sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/notifications/overdue',
  authorize(UserRole.ADMIN),
  socketController.sendOverdueNotifications
);

export default router;
