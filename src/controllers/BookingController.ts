import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, BookingStatus } from '../types';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const { bookId, borrowPeriodDays, notes } = req.body;

    const bookingData = {
      userId,
      bookId,
      borrowPeriodDays,
      notes,
      metadata: {
        requestSource: 'web' as const,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    };

    const booking = await this.bookingService.createBooking(bookingData);
    ResponseUtil.created(res, booking, 'Booking request created successfully');
  });

  getBookingById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return next(new AppError('User not authenticated', 401));
    }

    // Validate access
    await this.bookingService.validateUserBookingAccess(id, userId, userRole);

    const booking = await this.bookingService.getBookingById(id);
    ResponseUtil.success(res, booking, 'Booking retrieved successfully');
  });

  updateBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedBooking = await this.bookingService.updateBooking(id, updateData);
    ResponseUtil.updated(res, updatedBooking, 'Booking updated successfully');
  });

  deleteBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await this.bookingService.deleteBooking(id);
    ResponseUtil.deleted(res, 'Booking deleted successfully');
  });

  getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await this.bookingService.getAllBookings(query);

    ResponseUtil.paginated(
      res,
      result.records,
      'Bookings retrieved successfully',
      result.pagination
    );
  });

  getUserBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await this.bookingService.getUserBookings(userId, req.query);

    ResponseUtil.paginated(
      res,
      result.records,
      'User bookings retrieved successfully',
      result.pagination
    );
  });

  getUserBookingHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await this.bookingService.getUserBookingHistory(userId, req.query);

    ResponseUtil.paginated(
      res,
      result.records,
      'User booking history retrieved successfully',
      result.pagination
    );
  });

  getPendingBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.bookingService.getPendingBookings(req.query);

    ResponseUtil.paginated(
      res,
      result.records,
      'Pending bookings retrieved successfully',
      result.pagination
    );
  });

  getOverdueBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.bookingService.getOverdueBookings(req.query);

    ResponseUtil.paginated(
      res,
      result.records,
      'Overdue bookings retrieved successfully',
      result.pagination
    );
  });

  approveBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    const updatedBooking = await this.bookingService.approveBooking(id, adminId, notes);
    ResponseUtil.updated(res, updatedBooking, 'Booking approved successfully');
  });

  rejectBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!reason) {
      return next(new AppError('Rejection reason is required', 400));
    }

    const updatedBooking = await this.bookingService.rejectBooking(id, adminId, reason);
    ResponseUtil.updated(res, updatedBooking, 'Booking rejected successfully');
  });

  returnBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const updatedBooking = await this.bookingService.returnBook(id);
    ResponseUtil.updated(res, updatedBooking, 'Book returned successfully');
  });

  renewBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { additionalDays } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Validate access
    await this.bookingService.validateUserBookingAccess(id, userId, req.user?.role || '');

    const updatedBooking = await this.bookingService.renewBooking(id, additionalDays);
    ResponseUtil.updated(res, updatedBooking, 'Booking renewed successfully');
  });

  cancelBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const updatedBooking = await this.bookingService.cancelBooking(id, userId);
    ResponseUtil.updated(res, updatedBooking, 'Booking cancelled successfully');
  });

  getBookingStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await this.bookingService.getBookingStats();
    ResponseUtil.success(res, stats, 'Booking statistics retrieved successfully');
  });

  getPopularBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.bookingService.getPopularBooks(req.query);

    ResponseUtil.paginated(
      res,
      result.books,
      'Popular books retrieved successfully',
      result.pagination
    );
  });

  getBookingsDueSoon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { days } = req.query;
    const daysNumber = days ? parseInt(days as string, 10) : 3;

    const bookings = await this.bookingService.getBookingsDueSoon(daysNumber);
    ResponseUtil.success(res, bookings, 'Bookings due soon retrieved successfully');
  });

  updateOverdueBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const updatedCount = await this.bookingService.updateOverdueBookings();
    ResponseUtil.success(
      res,
      { updatedCount },
      `${updatedCount} bookings marked as overdue`
    );
  });

  rateBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    const updatedBooking = await this.bookingService.rateBooking(id, userId, rating);
    ResponseUtil.updated(res, updatedBooking, 'Book rated successfully');
  });
}
