import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { logger } from '../utils/logger';
import { TokenPayload } from '../types';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HttpServer) {
    const allowedOrigins = env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim());

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

        if (!decoded || typeof decoded !== 'object') {
          return next(new Error('Invalid token payload'));
        }
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;

        logger.info(`Socket authenticated for user: ${decoded.email}`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userEmail} (${socket.id})`);

      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
        
        // Join user to their personal room
        socket.join(`user:${socket.userId}`);
        
        // Join admin users to admin room
        if (socket.userRole === 'admin') {
          socket.join('admin');
        }
      }

      // Handle user joining specific rooms
      socket.on('join:book', (bookId: string) => {
        socket.join(`book:${bookId}`);
        logger.info(`User ${socket.userEmail} joined book room: ${bookId}`);
      });

      socket.on('leave:book', (bookId: string) => {
        socket.leave(`book:${bookId}`);
        logger.info(`User ${socket.userEmail} left book room: ${bookId}`);
      });

      // Handle real-time messaging
      socket.on('message:send', (data: { message: string; room?: string }) => {
        const messageData = {
          message: data.message,
          userId: socket.userId,
          userEmail: socket.userEmail,
          timestamp: new Date().toISOString(),
        };

        if (data.room) {
          socket.to(data.room).emit('message:received', messageData);
        } else {
          socket.broadcast.emit('message:received', messageData);
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (room: string) => {
        socket.to(room).emit('typing:user', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          isTyping: true,
        });
      });

      socket.on('typing:stop', (room: string) => {
        socket.to(room).emit('typing:user', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          isTyping: false,
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`User disconnected: ${socket.userEmail} (${reason})`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Digital Library real-time service',
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Booking-related events
  public emitBookingCreated(booking: any): void {
    // Notify admins about new booking
    this.io.to('admin').emit('booking:created', {
      type: 'booking_created',
      data: booking,
      timestamp: new Date().toISOString(),
    });

    // Notify the user who created the booking
    this.io.to(`user:${booking.userId}`).emit('booking:status', {
      type: 'booking_created',
      data: booking,
      message: 'Your booking request has been submitted successfully',
      timestamp: new Date().toISOString(),
    });

    logger.info(`Booking created event emitted for booking: ${booking._id}`);
  }

  public emitBookingUpdated(booking: any, previousStatus?: string): void {
    const eventType = `booking_${booking.status}`;
    
    // Notify the user who owns the booking
    this.io.to(`user:${booking.userId}`).emit('booking:status', {
      type: eventType,
      data: booking,
      previousStatus,
      message: this.getBookingStatusMessage(booking.status),
      timestamp: new Date().toISOString(),
    });

    // Notify admins
    this.io.to('admin').emit('booking:updated', {
      type: eventType,
      data: booking,
      previousStatus,
      timestamp: new Date().toISOString(),
    });

    // Notify users interested in the book
    this.io.to(`book:${booking.bookId}`).emit('book:availability_changed', {
      type: 'booking_status_changed',
      bookId: booking.bookId,
      bookingStatus: booking.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Booking updated event emitted for booking: ${booking._id} (${booking.status})`);
  }

  public emitBookAvailabilityChanged(book: any): void {
    // Notify all users interested in this book
    this.io.to(`book:${book._id}`).emit('book:availability_changed', {
      type: 'availability_changed',
      data: {
        bookId: book._id,
        title: book.title,
        availableCopies: book.availability.availableCopies,
        totalCopies: book.availability.totalCopies,
        status: book.status,
      },
      timestamp: new Date().toISOString(),
    });

    // Notify admins
    this.io.to('admin').emit('book:updated', {
      type: 'availability_changed',
      data: book,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Book availability changed event emitted for book: ${book._id}`);
  }

  public emitUserStatusChanged(user: any): void {
    // Notify the user about their status change
    this.io.to(`user:${user._id}`).emit('user:status_changed', {
      type: 'status_changed',
      data: {
        userId: user._id,
        status: user.status,
        role: user.role,
      },
      message: this.getUserStatusMessage(user.status),
      timestamp: new Date().toISOString(),
    });

    // Notify admins
    this.io.to('admin').emit('user:updated', {
      type: 'status_changed',
      data: user,
      timestamp: new Date().toISOString(),
    });

    logger.info(`User status changed event emitted for user: ${user._id} (${user.status})`);
  }

  public emitSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info', targetUsers?: string[]): void {
    const notification = {
      type: 'system_notification',
      level: type,
      message,
      timestamp: new Date().toISOString(),
    };

    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      targetUsers.forEach(userId => {
        this.io.to(`user:${userId}`).emit('notification', notification);
      });
    } else {
      // Broadcast to all connected users
      this.io.emit('notification', notification);
    }

    logger.info(`System notification emitted: ${message} (${type})`);
  }

  public emitBookingReminder(booking: any): void {
    // Notify user about upcoming due date
    this.io.to(`user:${booking.userId}`).emit('booking:reminder', {
      type: 'due_soon',
      data: booking,
      message: `Your book "${booking.book?.title}" is due soon. Please return it by ${new Date(booking.dueDate).toLocaleDateString()}.`,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Booking reminder emitted for booking: ${booking._id}`);
  }

  public emitOverdueNotification(booking: any): void {
    // Notify user about overdue book
    this.io.to(`user:${booking.userId}`).emit('booking:overdue', {
      type: 'overdue',
      data: booking,
      message: `Your book "${booking.book?.title}" is overdue. Please return it as soon as possible.`,
      timestamp: new Date().toISOString(),
    });

    // Notify admins
    this.io.to('admin').emit('booking:overdue', {
      type: 'overdue',
      data: booking,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Overdue notification emitted for booking: ${booking._id}`);
  }

  // Utility methods
  private getBookingStatusMessage(status: string): string {
    const messages = {
      pending: 'Your booking request is pending approval',
      approved: 'Your booking has been approved! You can now collect the book',
      rejected: 'Your booking request has been rejected',
      returned: 'Thank you for returning the book',
      overdue: 'Your book is overdue. Please return it as soon as possible',
    };
    return messages[status] || 'Booking status updated';
  }

  private getUserStatusMessage(status: string): string {
    const messages = {
      active: 'Your account is now active',
      blocked: 'Your account has been blocked. Please contact support',
      pending: 'Your account is pending approval',
    };
    return messages[status] || 'Account status updated';
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get Socket.IO instance for external use
  public getIO(): SocketIOServer {
    return this.io;
  }

  // Check if user is connected
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Send direct message to user
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send message to all admins
  public sendToAdmins(event: string, data: any): void {
    this.io.to('admin').emit(event, data);
  }
}

// Global socket manager instance
let socketManager: SocketManager;

export const initializeSocket = (httpServer: HttpServer): SocketManager => {
  socketManager = new SocketManager(httpServer);
  return socketManager;
};

export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized. Call initializeSocket first.');
  }
  return socketManager;
};
