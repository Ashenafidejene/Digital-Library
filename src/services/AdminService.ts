import { UserService } from './UserService';
import { BookService } from './BookService';
import { UserRepository } from '../repositories/UserRepository';
import { BookRepository } from '../repositories/BookRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { EventRepository } from '../repositories/EventRepository';
import mongoose from 'mongoose';
import { AppError, UserRole, UserStatus, BookStatus } from '../types';
import { SocketService } from './SocketService';

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    admins: number;
    newThisMonth: number;
  };
  books: {
    total: number;
    available: number;
    booked: number;
    maintenance: number;
    newThisMonth: number;
  };
  bookings: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    overdue: number;
  };
  categories: Array<{
    category: string;
    totalBooks: number;
    availableBooks: number;
  }>;
}

export interface SystemActivity {
  recentUsers: any[];
  recentBooks: any[];
  recentBookings: any[];
  popularBooks: any[];
}

export class AdminService {
  private userService: UserService;
  private bookService: BookService;
  private userRepository: UserRepository;
  private bookRepository: BookRepository;
  private bookingRepository: BookingRepository;
  private announcementRepository: AnnouncementRepository;
  private eventRepository: EventRepository;
  private socketService: SocketService;

  constructor() {
    this.userService = new UserService();
    this.bookService = new BookService();
    this.userRepository = new UserRepository();
    this.bookRepository = new BookRepository();
    this.bookingRepository = new BookingRepository();
    this.announcementRepository = new AnnouncementRepository();
    this.eventRepository = new EventRepository();
    this.socketService = new SocketService();
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [userStats, bookStats, categoryStats, bookingStats] = await Promise.all([
      this.userService.getUserStats(),
      this.bookService.getBookStats(),
      this.bookService.getCategoryStats(),
      this.bookingRepository.getBookingStats(),
    ]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [newUsersThisMonth, newBooksThisMonth] = await Promise.all([
      this.userRepository.findAll({
        page: 1,
        limit: 1000,
        // Add date filter for this month
      }),
      this.bookRepository.findAll({
        page: 1,
        limit: 1000,
        // Add date filter for this month
      }),
    ]);

    return {
      users: {
        total: userStats.totalUsers,
        active: userStats.activeUsers,
        blocked: userStats.blockedUsers,
        admins: userStats.adminUsers,
        newThisMonth: newUsersThisMonth.users.filter(user => 
          new Date(user.createdAt) >= startOfMonth
        ).length,
      },
      books: {
        total: bookStats.totalBooks,
        available: bookStats.availableBooks,
        booked: bookStats.bookedBooks,
        maintenance: bookStats.maintenanceBooks,
        newThisMonth: newBooksThisMonth.books.filter(book => 
          new Date(book.createdAt) >= startOfMonth
        ).length,
      },
      bookings: {
        total: bookingStats.total,
        pending: bookingStats.pending,
        approved: bookingStats.approved,
        rejected: bookingStats.rejected,
        overdue: bookingStats.overdue,
      },
      categories: categoryStats,
    };
  }

  async getDashboardChartsData(): Promise<any> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyBookings = await this.bookingRepository.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          borrowed: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          returned: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyNewMembers = await this.userRepository.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return { monthlyBookings, monthlyNewMembers };
  }

  async getSystemActivity(): Promise<SystemActivity> {
    const [recentUsers, recentBooks, popularBooks] = await Promise.all([
      this.userRepository.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      this.bookRepository.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      this.bookRepository.findPopular({
        page: 1,
        limit: 10,
      }),
    ]);

    return {
      recentUsers: recentUsers.users,
      recentBooks: recentBooks.books,
      recentBookings: [], // Will be implemented with booking module
      popularBooks: popularBooks.books,
    };
  }

  async getAllBooks(query: any): Promise<any> {
    return this.bookRepository.findAll(query);
  }

  async getBorrowingRecords(query: any): Promise<any> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc', search, status } = query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
      search,
      status,
    };
    const { records, pagination } = await this.bookingRepository.findAll(options);
    return { bookings: records, pagination };
  }

  async promoteUserToAdmin(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === UserRole.ADMIN) {
      throw new AppError('User is already an admin', 400);
    }

    return await this.userRepository.update(userId, { role: UserRole.ADMIN });
  }

  async demoteAdminToUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === UserRole.USER) {
      throw new AppError('User is already a regular user', 400);
    }

    return await this.userRepository.update(userId, { role: UserRole.USER });
  }

  async bulkUpdateBookStatus(bookIds: string[], status: BookStatus): Promise<void> {
    const updatePromises = bookIds.map(id => 
      this.bookService.updateBookStatus(id, status)
    );

    await Promise.all(updatePromises);
  }

  async bulkUpdateUserStatus(userIds: string[], status: UserStatus): Promise<void> {
    const updatePromises = userIds.map(id => 
      this.userService.updateUserStatus(id, status)
    );

    await Promise.all(updatePromises);
  }

  async getSystemHealth(): Promise<{
    database: { status: string; message: string };
    server: { status: string; uptime: number };
    memory: { used: number; total: number; percentage: number };
  }> {
    // Database health check would be implemented here
    const databaseHealth = { status: 'healthy', message: 'Database connection is stable' };

    // Server health
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    return {
      database: databaseHealth,
      server: {
        status: 'healthy',
        uptime: Math.floor(uptime),
      },
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage),
      },
    };
  }

  async getSystemStats(): Promise<any> {
    const [userStats, bookStats] = await Promise.all([
      this.userService.getUserStats(),
      this.bookService.getBookStats(),
    ]);
    return { userStats, bookStats };
  }

  async getAllUsers(query: any): Promise<any> {
    return this.userService.getAllUsers(query);
  }

  async blockUser(userId: string): Promise<any> {
    return this.userService.blockUser(userId);
  }

  async unblockUser(userId: string): Promise<any> {
    return this.userService.unblockUser(userId);
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return await this.userService.resetPassword(userId, newPassword);
  }

  async createBook(bookData: any): Promise<any> {
    // Assuming the admin user's ID is available in the request object
    // For now, I'll use a placeholder ID.
    const adminId = '60d21b4667d0d8992e610c85'; // Replace with actual admin ID from auth
    return this.bookService.createBook(bookData, adminId);
  }

  async updateBookStatus(bookId: string, status: BookStatus): Promise<any> {
    return this.bookService.updateBookStatus(bookId, status);
  }

  async exportUserData(format: 'json' | 'csv' = 'json'): Promise<any> {
    const users = await this.userRepository.findAll({
      page: 1,
      limit: 10000, // Large limit to get all users
    });

    if (format === 'json') {
      return users.users;
    }

    // For CSV format, we would convert to CSV here
    // For now, just return the data
    return users.users;
  }

  async exportBookData(format: 'json' | 'csv' = 'json'): Promise<any> {
    const books = await this.bookRepository.findAll({
      page: 1,
      limit: 10000, // Large limit to get all books
    });

    if (format === 'json') {
      return books.books;
    }

    // For CSV format, we would convert to CSV here
    // For now, just return the data
    return books.books;
  }

  async getAuditLog(query: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
  }): Promise<any> {
    // This would be implemented with a proper audit log system
    // For now, return empty array
    return {
      logs: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async validateAdminAccess(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Admin account is not active', 403);
    }
  }

  async approveBorrowingRequest(recordId: string, adminId: string): Promise<any> {
    const record = await this.bookingRepository.findById(recordId);
    if (!record) {
      throw new AppError('Borrowing record not found', 404);
    }

    await record.approve(new mongoose.Types.ObjectId(adminId));
    await this.socketService.notifyBookingApproved(record);
    return record;
  }

  async rejectBorrowingRequest(recordId: string, reason: string, adminId: string): Promise<any> {
    const record = await this.bookingRepository.findById(recordId);
    if (!record) {
      throw new AppError('Borrowing record not found', 404);
    }

    await record.reject(new mongoose.Types.ObjectId(adminId), reason);
    await this.socketService.notifyBookingRejected(record);
    return record;
  }

  async returnBook(recordId: string): Promise<any> {
    const record = await this.bookingRepository.findById(recordId);
    if (!record) {
      throw new AppError('Borrowing record not found', 404);
    }

    await record.markAsReturned();
    await this.socketService.notifyBookingReturned(record);
    return record;
  }

  async getUserBorrowingHistory(userId: string): Promise<any> {
    console.log("here is from this function ",userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const records = await this.bookingRepository.findAll({ userId });
    return records;
  }

  async getAnnouncements(query: any): Promise<any> {
    return this.announcementRepository.findAll(query);
  }

  async createAnnouncement(announcementData: any, adminId: string): Promise<any> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin user not found', 404);
    }
    const announcement = await this.announcementRepository.create({ ...announcementData, authorId: adminId, authorName: admin.name });
    this.socketService.notifyNewAnnouncement(announcement);
    return announcement;
  }

  async updateAnnouncement(announcementId: string, announcementData: any): Promise<any> {
    const announcement = await this.announcementRepository.findById(announcementId);
    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }
    return this.announcementRepository.update(announcementId, announcementData);
  }

  async deleteAnnouncement(announcementId: string): Promise<void> {
    await this.announcementRepository.delete(announcementId);
  }

  async toggleAnnouncementStatus(announcementId: string, status: string): Promise<any> {
    const announcement = await this.announcementRepository.findById(announcementId);
    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    return this.announcementRepository.update(announcementId, { status: status as 'draft' | 'published' | 'archived' });
  }

  async getEvents(query: any): Promise<any> {
    return this.eventRepository.findAll(query);
  }

  async createEvent(eventData: any, adminId: string): Promise<any> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin user not found', 404);
    }
    return this.eventRepository.create({ ...eventData, authorId: adminId, authorName: admin.name });
  }

  async updateEvent(eventId: string, eventData: any): Promise<any> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    return this.eventRepository.update(eventId, eventData);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.eventRepository.delete(eventId);
  }

  async generateReport(): Promise<any> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [newBooks, newMembers, popularBooks] = await Promise.all([
      this.bookRepository.findAll({
        page: 1,
        limit: 1000,
      }),
      this.userRepository.findAll({
        page: 1,
        limit: 1000,
      }),
      this.bookRepository.findPopular({
        page: 1,
        limit: 10,
      }),
    ]);

    return {
      newBooks: newBooks.books.filter(book => new Date(book.createdAt) >= startOfMonth),
      newMembers: newMembers.users.filter(user => new Date(user.createdAt) >= startOfMonth),
      popularBooks: popularBooks.books,
    };
  }
}
