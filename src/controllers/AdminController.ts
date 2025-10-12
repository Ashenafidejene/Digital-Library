import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { UserService } from '../services/UserService';
import { BookService } from '../services/BookService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, UserStatus, BookStatus } from '../types';

export class AdminController {
  private adminService: AdminService;
  private userService: UserService;
  private bookService: BookService;

  constructor() {
    this.adminService = new AdminService();
    this.userService = new UserService();
    this.bookService = new BookService();
  }

  getDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(userId);

    const [stats, activity, systemHealth] = await Promise.all([
      this.adminService.getDashboardStats(),
      this.adminService.getSystemActivity(),
      this.adminService.getSystemHealth(),
    ]);

    ResponseUtil.success(res, {
      stats,
      activity,
      systemHealth,
    }, 'Admin dashboard data retrieved successfully');
  });

  getStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(userId);

    const stats = await this.adminService.getDashboardStats();
    ResponseUtil.success(res, stats, 'Admin statistics retrieved successfully');
  });

  getSystemActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(userId);

    const activity = await this.adminService.getSystemActivity();
    ResponseUtil.success(res, activity, 'System activity retrieved successfully');
  });

  getSystemHealth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(userId);

    const health = await this.adminService.getSystemHealth();
    ResponseUtil.success(res, health, 'System health retrieved successfully');
  });

  promoteUserToAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedUser = await this.adminService.promoteUserToAdmin(userId);
    ResponseUtil.updated(res, updatedUser, 'User promoted to admin successfully');
  });

  demoteAdminToUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    // Prevent self-demotion
    if (userId === adminId) {
      return next(new AppError('You cannot demote yourself', 400));
    }

    const updatedUser = await this.adminService.demoteAdminToUser(userId);
    ResponseUtil.updated(res, updatedUser, 'Admin demoted to user successfully');
  });

  bulkUpdateUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userIds, status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError('User IDs array is required', 400));
    }

    if (!Object.values(UserStatus).includes(status)) {
      return next(new AppError('Invalid user status', 400));
    }

    await this.adminService.bulkUpdateUserStatus(userIds, status);
    ResponseUtil.success(res, null, `${userIds.length} users updated successfully`);
  });

  bulkUpdateBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookIds, status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return next(new AppError('Book IDs array is required', 400));
    }

    if (!Object.values(BookStatus).includes(status)) {
      return next(new AppError('Invalid book status', 400));
    }

    await this.adminService.bulkUpdateBookStatus(bookIds, status);
    ResponseUtil.success(res, null, `${bookIds.length} books updated successfully`);
  });

  exportUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { format = 'json' } = req.query;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    if (format !== 'json' && format !== 'csv') {
      return next(new AppError('Invalid format. Use json or csv', 400));
    }

    const userData = await this.adminService.exportUserData(format as 'json' | 'csv');

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=users.json');
    }

    ResponseUtil.success(res, userData, 'User data exported successfully');
  });

  exportBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { format = 'json' } = req.query;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    if (format !== 'json' && format !== 'csv') {
      return next(new AppError('Invalid format. Use json or csv', 400));
    }

    const bookData = await this.adminService.exportBookData(format as 'json' | 'csv');

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=books.csv');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=books.json');
    }

    ResponseUtil.success(res, bookData, 'Book data exported successfully');
  });

  getAuditLog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const auditLog = await this.adminService.getAuditLog(req.query);
    ResponseUtil.paginated(
      res,
      auditLog.logs,
      auditLog.pagination,
      'Audit log retrieved successfully'
    );
  });

  // User management endpoints (delegated to UserService)
  getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const result = await this.userService.getAllUsers(req.query);
    ResponseUtil.paginated(
      res,
      result.users,
      result.pagination,
      'Users retrieved successfully'
    );
  });

  getBorrowingRecords = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const result = await this.adminService.getBorrowingRecords(req.query);
    ResponseUtil.success(res, result.bookings || [], 'Borrowing records retrieved successfully');
  });

  blockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedUser = await this.userService.blockUser(userId);
    ResponseUtil.updated(res, updatedUser, 'User blocked successfully');
  });

  unblockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedUser = await this.userService.unblockUser(userId);
    ResponseUtil.updated(res, updatedUser, 'User unblocked successfully');
  });

  getUserBorrowingHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const adminId = req.user?.id;
    //console.log("here is useId" , userId ,"and admin id",adminId);
    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const history = await this.adminService.getUserBorrowingHistory(userId);
    console.log("this is the history",history);
    ResponseUtil.success(res, history, 'User borrowing history retrieved successfully');
  });

  // Book management endpoints (delegated to BookService)
  createBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req);
    console.log(res);
    console.log(next);
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const bookData = req.body;
    const book = await this.bookService.createBook(bookData, adminId);

    ResponseUtil.created(res, book, 'Book created successfully');
  });

  getAllBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);
    
    const result = await this.bookService.getAllBooks(req.query);
  //  console.log("this book ", result.books);
    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      'Books retrieved successfully'
    );
  });

  updateBookStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    if (!Object.values(BookStatus).includes(status)) {
      return next(new AppError('Invalid book status', 400));
    }

    const updatedBook = await this.bookService.updateBookStatus(bookId, status);
    ResponseUtil.updated(res, updatedBook, 'Book status updated successfully');
  });

  approveBorrowingRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedRecord = await this.adminService.approveBorrowingRequest(recordId, adminId);
    ResponseUtil.success(res, updatedRecord, 'Borrowing request approved successfully');
  });

  rejectBorrowingRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedRecord = await this.adminService.rejectBorrowingRequest(recordId, reason, adminId);
    ResponseUtil.success(res, updatedRecord, 'Borrowing request rejected successfully');
  });

  returnBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedRecord = await this.adminService.returnBook(recordId);
    ResponseUtil.success(res, updatedRecord, 'Book returned successfully');
  });

  // Announcement management endpoints
  getAnnouncements = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const result = await this.adminService.getAnnouncements(req.query);
    ResponseUtil.success(res, result.announcements || [], 'Announcements retrieved successfully');
  });

  createAnnouncement = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const announcementData = req.body;
    const announcement = await this.adminService.createAnnouncement(announcementData, adminId);

    ResponseUtil.created(res, announcement, 'Announcement created successfully');
  });

  deleteAnnouncement = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { announcementId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    await this.adminService.deleteAnnouncement(announcementId);
    ResponseUtil.success(res, null, 'Announcement deleted successfully');
  });

  toggleAnnouncementStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { announcementId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedAnnouncement = await this.adminService.toggleAnnouncementStatus(announcementId, status);
    ResponseUtil.updated(res, updatedAnnouncement, 'Announcement status updated successfully');
  });

  // Event management endpoints
  getEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const result = await this.adminService.getEvents(req.query);
    ResponseUtil.success(res, result.events || [], 'Events retrieved successfully');
  });

  createEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const eventData = req.body;
    const event = await this.adminService.createEvent(eventData, adminId);

    ResponseUtil.created(res, event, 'Event created successfully');
  });

  updateEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const eventData = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    const updatedEvent = await this.adminService.updateEvent(eventId, eventData);
    ResponseUtil.updated(res, updatedEvent, 'Event updated successfully');
  });

  deleteEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.adminService.validateAdminAccess(adminId);

    await this.adminService.deleteEvent(eventId);
    ResponseUtil.success(res, null, 'Event deleted successfully');
  });
}
