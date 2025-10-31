import { getSocketManager, SocketManager } from '../config/socket';
import { logger } from '../utils/logger';

export class SocketService {
  private socketManager: SocketManager;

  constructor() {
    this.socketManager = getSocketManager();
  }

  // Booking events
  async notifyBookingCreated(booking: any): Promise<void> {
    try {
      this.socketManager.emitBookingCreated(booking);
    } catch (error) {
      logger.error('Error emitting booking created event:', error);
    }
  }

  async notifyBookingApproved(booking: any): Promise<void> {
    try {
      this.socketManager.emitBookingUpdated(booking, 'pending');
    } catch (error) {
      logger.error('Error emitting booking approved event:', error);
    }
  }

  async notifyBookingRejected(booking: any): Promise<void> {
    try {
      this.socketManager.emitBookingUpdated(booking, 'pending');
    } catch (error) {
      logger.error('Error emitting booking rejected event:', error);
    }
  }

  async notifyBookingReturned(booking: any): Promise<void> {
    try {
      this.socketManager.emitBookingUpdated(booking, 'approved');
    } catch (error) {
      logger.error('Error emitting booking returned event:', error);
    }
  }

  async notifyBookingRenewed(booking: any): Promise<void> {
    try {
      this.socketManager.emitBookingUpdated(booking, 'approved');
    } catch (error) {
      logger.error('Error emitting booking renewed event:', error);
    }
  }

  // Book events
  async notifyBookAvailabilityChanged(book: any): Promise<void> {
    try {
      this.socketManager.emitBookAvailabilityChanged(book);
    } catch (error) {
      logger.error('Error emitting book availability changed event:', error);
    }
  }

  async notifyBookAdded(book: any): Promise<void> {
    try {
      this.socketManager.sendToAdmins('book:added', {
        type: 'book_added',
        data: book,
        message: `New book added: ${book.title}`,
        timestamp: new Date().toISOString(),
      });

      // Notify all users about new book
      this.socketManager.getIO().emit('book:new', {
        type: 'new_book',
        data: {
          id: book._id,
          title: book.title,
          author: book.author,
          category: book.category,
        },
        message: `New book available: ${book.title} by ${book.author}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error emitting book added event:', error);
    }
  }

  async notifyBookUpdated(book: any): Promise<void> {
    try {
      this.socketManager.sendToAdmins('book:updated', {
        type: 'book_updated',
        data: book,
        timestamp: new Date().toISOString(),
      });

      // If book becomes available, notify interested users
      if (book.status === 'available' && book.availability.availableCopies > 0) {
        this.socketManager.getIO().to(`book:${book._id}`).emit('book:available', {
          type: 'book_available',
          data: book,
          message: `${book.title} is now available for booking!`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Error emitting book updated event:', error);
    }
  }

  // User events
  async notifyUserStatusChanged(user: any): Promise<void> {
    try {
      this.socketManager.emitUserStatusChanged(user);
    } catch (error) {
      logger.error('Error emitting user status changed event:', error);
    }
  }

  async notifyUserRegistered(user: any): Promise<void> {
    try {
      this.socketManager.sendToAdmins('user:registered', {
        type: 'user_registered',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: `New user registered: ${user.name}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error emitting user registered event:', error);
    }
  }

  // System notifications
  async sendSystemNotification(
    message: string, 
    type: 'info' | 'warning' | 'error' = 'info',
    targetUsers?: string[]
  ): Promise<void> {
    try {
      this.socketManager.emitSystemNotification(message, type, targetUsers);
    } catch (error) {
      logger.error('Error sending system notification:', error);
    }
  }

  async sendMaintenanceNotification(startTime: Date, endTime: Date): Promise<void> {
    try {
      const message = `System maintenance scheduled from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}`;
      this.socketManager.emitSystemNotification(message, 'warning');
    } catch (error) {
      logger.error('Error sending maintenance notification:', error);
    }
  }

  // Reminder and overdue notifications
  async sendBookingReminders(): Promise<void> {
    try {
      // This would typically be called by a cron job
      // For now, we'll just log that it would send reminders
      logger.info('Sending booking reminders...');
      
      // In a real implementation, you would:
      // 1. Query for bookings due in 1-3 days
      // 2. Send reminders to each user
      // Example:
      // const dueSoonBookings = await BookingRepository.findBookingsDueSoon(3);
      // dueSoonBookings.forEach(booking => {
      //   this.socketManager.emitBookingReminder(booking);
      // });
    } catch (error) {
      logger.error('Error sending booking reminders:', error);
    }
  }

  async sendOverdueNotifications(): Promise<void> {
    try {
      // This would typically be called by a cron job
      logger.info('Sending overdue notifications...');
      
      // In a real implementation, you would:
      // 1. Query for overdue bookings
      // 2. Send notifications to each user and admins
      // Example:
      // const overdueBookings = await BookingRepository.findOverdueBookings();
      // overdueBookings.forEach(booking => {
      //   this.socketManager.emitOverdueNotification(booking);
      // });
    } catch (error) {
      logger.error('Error sending overdue notifications:', error);
    }
  }

  // Real-time statistics
  async broadcastStatistics(stats: any): Promise<void> {
    try {
      this.socketManager.sendToAdmins('stats:updated', {
        type: 'stats_updated',
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error broadcasting statistics:', error);
    }
  }

  // Connection status
  getConnectedUsersCount(): number {
    return this.socketManager.getConnectedUsersCount();
  }

  isUserConnected(userId: string): boolean {
    return this.socketManager.isUserConnected(userId);
  }

  // Direct messaging
  async sendDirectMessage(userId: string, message: string, type: string = 'message'): Promise<void> {
    try {
      this.socketManager.sendToUser(userId, 'direct:message', {
        type,
        message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error sending direct message:', error);
    }
  }

  // Admin broadcasts
  async broadcastToAdmins(event: string, data: any): Promise<void> {
    try {
      this.socketManager.sendToAdmins(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error broadcasting to admins:', error);
    }
  }

  // Emergency notifications
  async sendEmergencyNotification(message: string): Promise<void> {
    try {
      this.socketManager.getIO().emit('emergency', {
        type: 'emergency',
        message,
        timestamp: new Date().toISOString(),
        priority: 'high',
      });
    } catch (error) {
      logger.error('Error sending emergency notification:', error);
    }
  }

  // Announcement events
  async notifyNewAnnouncement(announcement: any): Promise<void> {
    try {
      this.socketManager.getIO().emit('announcement:new', {
        type: 'new_announcement',
        data: announcement,
        message: `New announcement: ${announcement.title}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error emitting new announcement event:', error);
    }
  }
}
