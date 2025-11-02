import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { BookService } from '../services/BookService';
import { UserService } from '../services/UserService';
import { BookingService } from '../services/BookingService';
import { ReportService } from '../services/ReportService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { UserRole, BookingStatus } from '../types';
import AppError from '../utils/AppError';

export class DashboardController {
  private adminService: AdminService;
  private bookService: BookService;
  private userService: UserService;
  private bookingService: BookingService;
  private reportService: ReportService;

  constructor() {
    this.adminService = new AdminService();
    this.bookService = new BookService();
    this.userService = new UserService();
    this.bookingService = new BookingService();
    this.reportService = new ReportService();
  }

  // GET /api/v1/dashboard/overview
  getOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (user.role === UserRole.ADMIN) {
      const result = await this.adminService.getDashboardStats();
      const stats = {
        totalMembers: result.users.total,
        totalBooks: result.books.total,
        borrowedBooks: result.books.booked,
        overdueBooks: result.bookings.overdue,
        reservedBooks: result.bookings.pending,
        newMembersThisMonth: result.users.newThisMonth,
      };
      const recentBookings = await this.bookingService.getAllBookings({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const recentActivity = recentBookings.records.map((booking: any) => ({
        id: booking.id,
        type: booking.status.toLowerCase(),
        user: booking.user.name,
        book: booking.book.title,
        timestamp: booking.createdAt,
      }));

      ResponseUtil.success(res, { stats, recentActivity }, 'Dashboard overview retrieved successfully');
    } else {
      const borrowedBooks = await this.bookingService.getUserBookings(user.id, {
        status: BookingStatus.APPROVED,
      });
      const reservedBooks = await this.bookingService.getUserBookings(user.id, {
        status: BookingStatus.PENDING,
      });
      const readingHistory = await this.bookingService.getUserBookings(user.id, {
        status: BookingStatus.RETURNED,
      });
      const dueSoonNotifications = await this.bookingService.getBookingsDueSoon(3);
      const recentBookings = await this.bookingService.getRecentUserBookings(user.id, 3);

      const notifications = [
        ...dueSoonNotifications.map((b: any) => ({
          id: b._id,
          type: 'due_soon',
          title: 'Book Due Soon',
          message: `Your copy of "${b.book.title}" is due soon.`,
          date: b.dueDate,
          read: false,
        })),
        ...recentBookings.map((b: any) => ({
          id: b._id,
          type: 'new_booking',
          title: 'Booking Confirmed',
          message: `You have successfully booked "${b.book.title}".`,
          date: b.createdAt,
          read: false,
        })),
      ];

      const userWithFavorites = await this.userService.getUserById(user.id);
      const userDashboardData = {
        borrowedBooks: borrowedBooks.records,
        reservedBooks: reservedBooks.records,
        readingHistory: readingHistory.records,
        notifications,
        favoriteBooks: userWithFavorites?.favoriteBooks || [],
      };
      ResponseUtil.success(res, userDashboardData, 'Dashboard overview retrieved successfully');
    }
  });

  // GET /api/v1/dashboard/borrowed-books
  getBorrowedBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    console.log(`Fetching borrowed books for user: ${userId}`);
    const result = await this.bookingService.getUserBookings(userId, {
      ...req.query,
      status: BookingStatus.APPROVED,
    });
    console.log('Borrowed books data from service:', JSON.stringify(result, null, 2));
    ResponseUtil.success(res, result.records, 'Borrowed books retrieved successfully');
  });

  // GET /api/v1/dashboard/reserved-books
  getReservedBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    const result = await this.bookingService.getUserBookings(userId, {
      ...req.query,
      status: BookingStatus.PENDING,
    });
    ResponseUtil.success(res, result.records, 'Reserved books retrieved successfully');
  });

  // GET /api/v1/dashboard/reading-history
  getReadingHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    const result = await this.bookingService.getUserBookings(userId, {
      ...req.query,
      status: BookingStatus.RETURNED,
    });
    ResponseUtil.success(res, result.records, 'Reading history retrieved successfully');
  });

  // GET /api/v1/dashboard/notifications
  getNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await this.bookingService.getBookingsDueSoon(3);
    const formattedNotifications = notifications.map((b: any) => ({
      id: b._id,
      type: 'due_soon',
      title: 'Book Due Soon',
      message: `Your copy of "${b.book.title}" is due soon.`,
      date: b.dueDate,
      read: false,
    }));
    ResponseUtil.success(res, formattedNotifications, 'Notifications retrieved successfully');
  });

  // GET /api/v1/dashboard/favorite-books
  getFavoriteBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    console.log(`Fetching favorite books for user: ${userId}`);
    const user = await this.userService.getUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    console.log('Favorite books data from service:', JSON.stringify(user.favoriteBooks, null, 2));
    ResponseUtil.success(res, user.favoriteBooks, 'Favorite books retrieved successfully');
  });

  // POST /api/v1/dashboard/send-reminder/:bookingId
  sendReminder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    // In a real app, you'd have logic to send an email or push notification
    ResponseUtil.success(res, { bookingId, reminderSent: true }, 'Reminder sent successfully');
  });

  // POST /api/v1/dashboard/renew-book/:bookingId
  renewBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    await this.bookingService.validateUserBookingAccess(bookingId, userId, req.user.role);
    const renewedBooking = await this.bookingService.renewBooking(bookingId);
    ResponseUtil.success(res, renewedBooking, 'Book renewed successfully');
  });

  // POST /api/v1/dashboard/return-book/:bookingId
  returnBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    await this.bookingService.validateUserBookingAccess(bookingId, userId, req.user.role);
    const returnedBooking = await this.bookingService.returnBook(bookingId);
    ResponseUtil.success(res, returnedBooking, 'Book returned successfully');
  });

  // POST /api/v1/dashboard/cancel-reservation/:bookingId
  cancelReservation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    const cancelledBooking = await this.bookingService.cancelBooking(bookingId, userId);
    ResponseUtil.success(res, cancelledBooking, 'Reservation cancelled successfully');
  });

  // GET /api/v1/dashboard/charts
  getChartsData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== UserRole.ADMIN) {
      return next(new AppError('Unauthorized', 403));
    }
    const chartsData = await this.adminService.getDashboardChartsData();
    ResponseUtil.success(res, chartsData, 'Chart data retrieved successfully');
  });

  // GET /api/v1/dashboard/generate-report
  generateReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== UserRole.ADMIN) {
      return next(new AppError('Unauthorized', 403));
    }

    await this.reportService.generateLibraryReport(res);
  });

  // GET /api/v1/dashboard/home-stats
  getHomePageStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const totalBooks = await this.bookService.getBookCount();
    const totalMembers = await this.userService.getUserCount();
    const totalCategories = await this.bookService.getCategoryCount();

    const stats = {
      totalBooks,
      totalMembers,
      totalCategories,
    };

    ResponseUtil.success(res, stats, 'Home page stats retrieved successfully');
  });
}
