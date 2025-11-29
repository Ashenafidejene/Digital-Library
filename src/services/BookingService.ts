import { BookingRepository, BookingQuery } from '../repositories/BookingRepository';
import { BookService } from './BookService';
import { SocketService } from './SocketService';
import { IBooking } from '../entities/Booking';
import { AppError, BookingStatus, PaginationQuery } from '../types';
import { Types } from 'mongoose';

export interface CreateBookingData {
  userId: string;
  bookId: string;
  borrowPeriodDays?: number;
  notes?: string;
  metadata?: {
    requestSource?: 'web' | 'mobile' | 'admin';
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface UpdateBookingData {
  status?: BookingStatus;
  adminNotes?: string;
  borrowPeriodDays?: number;
  notes?: string;
}

export class BookingService {
  private bookingRepository: BookingRepository;
  private bookService: BookService;
  private socketService: SocketService;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.bookService = new BookService();
    // Initialize SocketService only if socket manager is available
    try {
      this.socketService = new SocketService();
    } catch (error) {
      // Socket manager not initialized yet, will be set later
    }
  }

  private getSocketService(): SocketService | null {
    try {
      if (!this.socketService) {
        this.socketService = new SocketService();
      }
      return this.socketService;
    } catch (error) {
      return null;
    }
  }

  async createBooking(data: CreateBookingData): Promise<IBooking> {
    // Check if book exists and is available
    const book = await this.bookService.getBookById(data.bookId);
    if (!book.isAvailable()) {
      throw new AppError('Book is not available for booking', 400);
    }

    // Check if user already has an active booking for this book
    const existingBooking = await this.bookingRepository.findActiveBookingForUserAndBook(
      data.userId,
      data.bookId
    );
    if (existingBooking) {
      throw new AppError('You already have an active booking for this book', 409);
    }

    // Create booking
    const bookingData = {
      userId: new Types.ObjectId(data.userId),
      bookId: new Types.ObjectId(data.bookId),
      borrowPeriodDays: data.borrowPeriodDays || 14,
      notes: data.notes,
      metadata: {
        requestSource: data.metadata?.requestSource || 'web',
        ipAddress: data.metadata?.ipAddress,
        userAgent: data.metadata?.userAgent,
      },
    };

    const booking = await this.bookingRepository.create(bookingData as any);

    // Reserve the book (decrease available copies)
    await this.bookService.reserveBook(data.bookId);

    // Emit real-time event
    const socketService = this.getSocketService();
    if (socketService) {
      await socketService.notifyBookingCreated(booking);
    }

    return booking;
  }

  async getBookingById(id: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findByIdWithDetails(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    return booking;
  }

  async updateBooking(id: string, updateData: UpdateBookingData): Promise<IBooking> {
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new AppError('Booking not found', 404);
    }

    const updatedBooking = await this.bookingRepository.update(id, updateData);
    if (!updatedBooking) {
      throw new AppError('Failed to update booking', 500);
    }

    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Only allow deletion of pending bookings
    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError('Only pending bookings can be deleted', 400);
    }

    // Release the book (increase available copies)
    await this.bookService.releaseBook(booking.bookId.toString());

    const deleted = await this.bookingRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete booking', 500);
    }
  }

  async getAllBookings(query: BookingQuery) {
    return await this.bookingRepository.findAll(query);
  }

  async getUserBookings(userId: string, query: BookingQuery) {
    //console.log(`Fetching bookings for userId: ${userId}`);
    const bookings = await this.bookingRepository.findByUserId(userId, { ...query, status: query.status });
    //console.log(`Found bookings for userId ${userId}:`, bookings);
    return bookings;
  }

  async getBookBookings(bookId: string, query: PaginationQuery) {
    return await this.bookingRepository.findByBookId(bookId, query);
  }

  async getPendingBookings(query: PaginationQuery) {
    return await this.bookingRepository.findPendingBookings(query);
  }

  async getOverdueBookings(query: PaginationQuery) {
    return await this.bookingRepository.findOverdueBookings(query);
  }

  async approveBooking(id: string, adminId: string, notes?: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError('Only pending bookings can be approved', 400);
    }

    // Check if book is still available
    const book = await this.bookService.getBookById(booking.bookId.toString());
    if (!book.isAvailable() && book.availability.availableCopies === 0) {
      throw new AppError('Book is no longer available', 400);
    }

    const updatedBooking = await this.bookingRepository.update(id, {
      status: BookingStatus.APPROVED,
      approvedBy: adminId as any,
      approvedDate: new Date(),
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + (booking.borrowPeriodDays * 24 * 60 * 60 * 1000)),
      adminNotes: notes,
    });

    if (!updatedBooking) {
      throw new AppError('Failed to approve booking', 500);
    }

    // Emit real-time event
    const socketService = this.getSocketService();
    if (socketService) {
      await socketService.notifyBookingApproved(updatedBooking);
    }

    return updatedBooking;
  }

  async rejectBooking(id: string, adminId: string, reason: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError('Only pending bookings can be rejected', 400);
    }

    // Release the book (increase available copies)
    await this.bookService.releaseBook(booking.bookId.toString());

    const updatedBooking = await this.bookingRepository.update(id, {
      status: BookingStatus.REJECTED,
      rejectedBy: adminId as any,
      rejectedDate: new Date(),
      adminNotes: reason,
    });

    if (!updatedBooking) {
      throw new AppError('Failed to reject booking', 500);
    }

    // Emit real-time event
    const socketService = this.getSocketService();
    if (socketService) {
      await socketService.notifyBookingRejected(updatedBooking);
    }

    return updatedBooking;
  }

  async returnBook(id: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== BookingStatus.APPROVED && booking.status !== BookingStatus.OVERDUE) {
      throw new AppError('Only approved or overdue bookings can be returned', 400);
    }

    // Release the book (increase available copies)
    await this.bookService.releaseBook(booking.bookId.toString());

    const updatedBooking = await this.bookingRepository.update(id, {
      status: BookingStatus.RETURNED,
      returnDate: new Date(),
    });

    if (!updatedBooking) {
      throw new AppError('Failed to return book', 500);
    }

    // Emit real-time event
    const socketService = this.getSocketService();
    if (socketService) {
      await socketService.notifyBookingReturned(updatedBooking);
    }

    return updatedBooking;
  }

  async renewBooking(id: string, additionalDays?: number): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (!booking.canBeRenewed()) {
      throw new AppError('Booking cannot be renewed', 400);
    }

    const renewalDays = additionalDays || booking.borrowPeriodDays;
    const newDueDate = new Date(booking.dueDate!.getTime() + (renewalDays * 24 * 60 * 60 * 1000));

    const updatedBooking = await this.bookingRepository.update(id, {
      dueDate: newDueDate,
      renewalCount: booking.renewalCount + 1,
    });

    if (!updatedBooking) {
      throw new AppError('Failed to renew booking', 500);
    }

    return updatedBooking;
  }

  async getBookingStats() {
    return await this.bookingRepository.getBookingStats();
  }

  async getUserBookingHistory(userId: string, query: PaginationQuery) {
    return await this.bookingRepository.getUserBookingHistory(userId, query);
  }

  async getPopularBooks(query: PaginationQuery) {
    return await this.bookingRepository.getPopularBooks(query);
  }

  async getBookingsDueSoon(days: number = 3) {
    return await this.bookingRepository.findBookingsDueSoon(days);
  }

  async getRecentUserBookings(userId: string, days: number = 3) {
    return await this.bookingRepository.findRecentUserBookings(userId, days);
  }

  async updateOverdueBookings(): Promise<number> {
    return await this.bookingRepository.updateOverdueBookings();
  }

  async validateUserBookingAccess(bookingId: string, userId: string, userRole: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Admin can access any booking
    if (userRole === 'admin') {
      return;
    }

    // Users can only access their own bookings
    if (booking.userId.toString() !== userId) {
      throw new AppError('You can only access your own bookings', 403);
    }
  }

  async cancelBooking(id: string, userId: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== userId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    // Only allow cancellation of pending bookings
    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError('Only pending bookings can be cancelled', 400);
    }

    // Release the book (increase available copies)
    await this.bookService.releaseBook(booking.bookId.toString());

    const updatedBooking = await this.bookingRepository.update(id, {
      status: BookingStatus.REJECTED,
      adminNotes: 'Cancelled by user',
    });

    if (!updatedBooking) {
      throw new AppError('Failed to cancel booking', 500);
    }

    return updatedBooking;
  }

  async rateBooking(id: string, userId: string, rating: number): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== userId) {
      throw new AppError('You can only rate your own bookings', 403);
    }

    // Only allow rating of returned bookings
    if (booking.status !== BookingStatus.RETURNED) {
      throw new AppError('You can only rate returned books', 400);
    }

    const updatedBooking = await this.bookingRepository.update(id, { rating });
    if (!updatedBooking) {
      throw new AppError('Failed to rate booking', 500);
    }

    return updatedBooking;
  }
}
