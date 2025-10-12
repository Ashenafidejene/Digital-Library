import { Request, Response, NextFunction } from 'express';
import { SocketService } from '../services/SocketService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../types';

export class SocketController {
  private socketService: SocketService;

  constructor() {
    try {
      this.socketService = new SocketService();
    } catch (error) {
      // Socket service will be initialized when socket manager is ready
    }
  }

  private getSocketService(): SocketService {
    if (!this.socketService) {
      this.socketService = new SocketService();
    }
    return this.socketService;
  }

  getConnectionStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const socketService = this.getSocketService();
    const connectedUsers = socketService.getConnectedUsersCount();

    ResponseUtil.success(res, {
      connectedUsers,
      status: 'active',
      timestamp: new Date().toISOString(),
    }, 'Socket connection status retrieved successfully');
  });

  sendSystemNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { message, type = 'info', targetUsers } = req.body;

    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    const socketService = this.getSocketService();
    await socketService.sendSystemNotification(message, type, targetUsers);

    ResponseUtil.success(res, null, 'System notification sent successfully');
  });

  sendMaintenanceNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return next(new AppError('Start time and end time are required', 400));
    }

    const socketService = this.getSocketService();
    await socketService.sendMaintenanceNotification(new Date(startTime), new Date(endTime));

    ResponseUtil.success(res, null, 'Maintenance notification sent successfully');
  });

  sendDirectMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { message, type = 'message' } = req.body;

    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    const socketService = this.getSocketService();
    await socketService.sendDirectMessage(userId, message, type);

    ResponseUtil.success(res, null, 'Direct message sent successfully');
  });

  broadcastToAdmins = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { event, data } = req.body;

    if (!event || !data) {
      return next(new AppError('Event and data are required', 400));
    }

    const socketService = this.getSocketService();
    await socketService.broadcastToAdmins(event, data);

    ResponseUtil.success(res, null, 'Message broadcasted to admins successfully');
  });

  sendEmergencyNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;

    if (!message) {
      return next(new AppError('Emergency message is required', 400));
    }

    const socketService = this.getSocketService();
    await socketService.sendEmergencyNotification(message);

    ResponseUtil.success(res, null, 'Emergency notification sent successfully');
  });

  sendBookingReminders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const socketService = this.getSocketService();
    await socketService.sendBookingReminders();

    ResponseUtil.success(res, null, 'Booking reminders sent successfully');
  });

  sendOverdueNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const socketService = this.getSocketService();
    await socketService.sendOverdueNotifications();

    ResponseUtil.success(res, null, 'Overdue notifications sent successfully');
  });

  broadcastStatistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { stats } = req.body;

    if (!stats) {
      return next(new AppError('Statistics data is required', 400));
    }

    const socketService = this.getSocketService();
    await socketService.broadcastStatistics(stats);

    ResponseUtil.success(res, null, 'Statistics broadcasted successfully');
  });

  checkUserConnection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const socketService = this.getSocketService();
    const isConnected = socketService.isUserConnected(userId);

    ResponseUtil.success(res, {
      userId,
      isConnected,
      timestamp: new Date().toISOString(),
    }, 'User connection status checked successfully');
  });

  getSocketEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const events = {
      booking: [
        'booking:created',
        'booking:status',
        'booking:updated',
        'booking:reminder',
        'booking:overdue',
      ],
      book: [
        'book:availability_changed',
        'book:updated',
        'book:added',
        'book:new',
        'book:available',
      ],
      user: [
        'user:status_changed',
        'user:updated',
        'user:registered',
      ],
      system: [
        'notification',
        'emergency',
        'connected',
        'message:received',
        'typing:user',
      ],
      admin: [
        'stats:updated',
        'direct:message',
      ],
    };

    ResponseUtil.success(res, events, 'Socket events list retrieved successfully');
  });
}
