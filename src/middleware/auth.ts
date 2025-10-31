import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppError, UserRole, TokenPayload } from '../types';
import { env } from '../config/env';
import { catchAsync } from './errorHandler';

export const authenticate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Authenticate Middleware ---');
    // 1) Getting token and check if it's there
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    console.log('Token:', token);

    if (!token) {
      console.log('Authentication failed: No token provided.');
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
      console.log('Decoded Token:', decoded);
    } catch (error) {
      console.log('Authentication failed: Token verification failed.', error);
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId).select('+refreshTokens');
    if (!currentUser) {
      console.log(`Authentication failed: User with ID ${decoded.userId} not found.`);
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }
    console.log('Current User:', currentUser._id, currentUser.email, currentUser.role);

    // 4) Check if user is active
    if (currentUser.status !== 'active') {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 5) Grant access to protected route
    req.user = {
      id: currentUser._id.toString(),
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
    };
    console.log('Authentication successful. User set:', req.user);

    next();
  }
);

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const optionalAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
        const currentUser = await User.findById(decoded.userId);
        
        if (currentUser && currentUser.status === 'active') {
          req.user = {
            id: currentUser._id.toString(),
            email: currentUser.email,
            role: currentUser.role,
            status: currentUser.status,
          };
        }
      } catch (error) {
        // Token is invalid, but we continue without user
      }
    }

    next();
  }
);

export const checkOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if the resource belongs to the user
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return next(new AppError('You can only access your own resources', 403));
    }

    next();
  };
};
