import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    const result = await this.authService.register({
      name,
      email,
      password,
      role,
    });

    ResponseUtil.success(res, result, 'User registered successfully', 201);
  });

  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await this.authService.login({
      email,
      password,
    });

    ResponseUtil.success(res, result, 'Login successful');
  });

  refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

    ResponseUtil.success(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully');
  });

  logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    await this.authService.logout(userId, refreshToken);

    ResponseUtil.success(res, null, 'Logout successful');
  });

  logoutAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    await this.authService.logoutAll(userId);

    ResponseUtil.success(res, null, 'Logged out from all devices successfully');
  });

  changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }

    await this.authService.changePassword(userId, currentPassword, newPassword);

    ResponseUtil.success(res, null, 'Password changed successfully');
  });

  forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    await this.authService.forgotPassword(email);

    ResponseUtil.success(
      res,
      null,
      'If an account with that email exists, a password reset link has been sent'
    );
  });

  resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(new AppError('Token and new password are required', 400));
    }

    await this.authService.resetPassword(token, newPassword);

    ResponseUtil.success(res, null, 'Password reset successfully');
  });

  getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Get user profile (this would typically be in a UserService)
    const userRepository = new (await import('../repositories/UserRepository')).UserRepository();
    const user = await userRepository.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    ResponseUtil.success(res, user, 'Profile retrieved successfully');
  });

  verifyToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // This endpoint is protected by authenticate middleware
    // If we reach here, the token is valid
    ResponseUtil.success(res, { user: req.user }, 'Token is valid');
  });
}
