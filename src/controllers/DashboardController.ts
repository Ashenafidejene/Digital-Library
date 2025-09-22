import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { BookService } from '../services/BookService';
import { UserService } from '../services/UserService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../types';

export class DashboardController {
  private adminService: AdminService;
  private bookService: BookService;
  private userService: UserService;

  constructor() {
    this.adminService = new AdminService();
    this.bookService = new BookService();
    this.userService = new UserService();
  }

  // GET /api/v1/dashboard/overview
  getOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Get dashboard stats
    const result= await this.adminService.getDashboardStats();
    const stats = {
  totalMembers: Number(result?.users?.total ?? 0),
  totalBooks: Number(result?.books?.total ?? 0),
  borrowedBooks: Number(result?.books?.booked ?? 0),        // <-- mapped to "booked"
  overdueBooks: Number(result?.bookings?.overdue ?? 0),     // <-- from bookings
  reservedBooks: Number(result?.bookings?.pending ?? 0),    // <-- pending = reserved
  newMembersThisMonth: Number(result?.users?.newThisMonth ?? 0)
};
console.log(result);

    // Get recent activity (mock data for now)
    const recentActivity = [
      {
        id: '1',
        type: 'borrow',
        user: 'Ashenafi ',
        book: 'The Great Gatsby',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'return',
        user: 'Jane Smith',
        book: 'To Kill a Mockingbird',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    

    ResponseUtil.success(res, {
      stats,
      recentActivity
    }, 'Dashboard overview retrieved successfully');
  });

  // GET /api/v1/dashboard/borrowed-books
  getBorrowedBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock borrowed books data
    const borrowedBooks = [
      {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        borrowerPhone: '+1234567890',
        borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'borrowed',
        renewalCount: 0,
        maxRenewals: 2
      }
    ];

    ResponseUtil.success(res, borrowedBooks, 'Borrowed books retrieved successfully');
  });

  // GET /api/v1/dashboard/reserved-books
  getReservedBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock reserved books data
    const reservedBooks = [
      {
        id: '1',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        reserverName: 'Jane Smith',
        reservedDate: new Date().toISOString(),
        position: 1
      }
    ];

    ResponseUtil.success(res, reservedBooks, 'Reserved books retrieved successfully');
  });

  // GET /api/v1/dashboard/reading-history
  getReadingHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock reading history data
    const readingHistory = [
      {
        id: '1',
        title: '1984',
        author: 'George Orwell',
        borrowerName: 'John Doe',
        borrowDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        returnDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5
      }
    ];

    ResponseUtil.success(res, readingHistory, 'Reading history retrieved successfully');
  });

  // POST /api/v1/dashboard/send-reminder/:bookId
  sendReminder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock reminder functionality
    ResponseUtil.success(res, {
      bookId,
      reminderSent: true,
      timestamp: new Date().toISOString()
    }, 'Reminder sent successfully');
  });

  // POST /api/v1/dashboard/renew-book/:bookId
  renewBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock renewal functionality
    ResponseUtil.success(res, {
      bookId,
      newDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      renewalCount: 1,
      timestamp: new Date().toISOString()
    }, 'Book renewed successfully');
  });

  // POST /api/v1/dashboard/return-book/:bookId
  returnBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock return functionality
    ResponseUtil.success(res, {
      bookId,
      returnDate: new Date().toISOString(),
      status: 'returned'
    }, 'Book returned successfully');
  });

  // POST /api/v1/dashboard/cancel-reservation/:reservationId
  cancelReservation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { reservationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Mock cancellation functionality
    ResponseUtil.success(res, {
      reservationId,
      cancelled: true,
      timestamp: new Date().toISOString()
    }, 'Reservation cancelled successfully');
  });
}
