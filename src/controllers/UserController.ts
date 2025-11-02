import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, UserRole, UserStatus } from '../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const user = await this.userService.getUserById(userId);
    ResponseUtil.success(res, user, 'Profile retrieved successfully');
  });

  updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const updateData = req.body;
    const updatedUser = await this.userService.updateUser(userId, updateData);

    ResponseUtil.updated(res, updatedUser, 'Profile updated successfully');
  });

  getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      return next(new AppError('User not authenticated', 401));
    }

    // Validate access
    await this.userService.validateUserAccess(id, requestingUserId, requestingUserRole);

    const user = await this.userService.getUserById(id);
    ResponseUtil.success(res, user, 'User retrieved successfully');
  });

  getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await this.userService.getAllUsers(query);
    //console.log("you are right",result);
    ResponseUtil.paginated(
      res,
      result.users,
      result.pagination,
      'Users retrieved successfully'
    );
  });

  updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await this.userService.updateUser(id, updateData);
    ResponseUtil.updated(res, updatedUser, 'User updated successfully');
  });

  deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await this.userService.deleteUser(id);
    ResponseUtil.deleted(res, 'User deleted successfully');
  });

  blockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const updatedUser = await this.userService.blockUser(id);
    ResponseUtil.updated(res, updatedUser, 'User blocked successfully');
  });

  unblockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const updatedUser = await this.userService.unblockUser(id);
    ResponseUtil.updated(res, updatedUser, 'User unblocked successfully');
  });

  getUserStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await this.userService.getUserStats();
    ResponseUtil.success(res, stats, 'User statistics retrieved successfully');
  });

  searchUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.query;
    
    if (!search || typeof search !== 'string') {
      return next(new AppError('Search term is required', 400));
    }

    const result = await this.userService.searchUsers(search, req.query);

    ResponseUtil.paginated(
      res,
      result.users,
      result.pagination,
      'Users search completed successfully'
    );
  });

  getUsersByRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.params;

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return next(new AppError('Invalid user role', 400));
    }

    const result = await this.userService.getUsersByRole(role as UserRole, req.query);

    ResponseUtil.paginated(
      res,
      result.users,
      result.pagination,
      `Users with role ${role} retrieved successfully`
    );
  });

  getUsersByStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;

    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      return next(new AppError('Invalid user status', 400));
    }

    const result = await this.userService.getUsersByStatus(status as UserStatus, req.query);

    ResponseUtil.paginated(
      res,
      result.users,
      result.pagination,
      `Users with status ${status} retrieved successfully`
    );
  });

  updatePreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const preferences = req.body;
    const updatedUser = await this.userService.updateUserPreferences(userId, preferences);

    ResponseUtil.updated(res, updatedUser, 'Preferences updated successfully');
  });

  addFavoriteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { category } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!category) {
      return next(new AppError('Category is required', 400));
    }

    const updatedUser = await this.userService.addFavoriteCategory(userId, category);
    ResponseUtil.updated(res, updatedUser, 'Favorite category added successfully');
  });

  removeFavoriteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { category } = req.params;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const updatedUser = await this.userService.removeFavoriteCategory(userId, category);
    ResponseUtil.updated(res, updatedUser, 'Favorite category removed successfully');
  });

  getFavoriteBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const favoriteBooks = await this.userService.getFavoriteBooks(userId);
    ResponseUtil.success(res, favoriteBooks, 'Favorite books retrieved successfully');
  });

  addFavoriteBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { bookId } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!bookId) {
      return next(new AppError('Book ID is required', 400));
    }

    const updatedUser = await this.userService.addFavoriteBook(userId, bookId);
    ResponseUtil.updated(res, updatedUser, 'Book added to favorites successfully');
  });

  removeFavoriteBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const updatedUser = await this.userService.removeFavoriteBook(userId, bookId);
    ResponseUtil.updated(res, updatedUser, 'Book removed from favorites successfully');
  });

  toggleFavoriteBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await this.userService.toggleFavoriteBook(userId, bookId);
    ResponseUtil.success(res, result, result.message);
  });
}
