import { UserService } from './UserService';
import { BookService } from './BookService';
import { UserRepository } from '../repositories/UserRepository';
import { BookRepository } from '../repositories/BookRepository';
import { AppError, UserRole, UserStatus, BookStatus } from '../types';

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

  constructor() {
    this.userService = new UserService();
    this.bookService = new BookService();
    this.userRepository = new UserRepository();
    this.bookRepository = new BookRepository();
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [userStats, bookStats, categoryStats] = await Promise.all([
      this.userService.getUserStats(),
      this.bookService.getBookStats(),
      this.bookService.getCategoryStats(),
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
        total: 0, // Will be implemented with booking module
        pending: 0,
        approved: 0,
        rejected: 0,
        overdue: 0,
      },
      categories: categoryStats,
    };
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
}
