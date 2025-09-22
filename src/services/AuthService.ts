import { UserRepository } from '../repositories/UserRepository';
import { SocketService } from './SocketService';
import { IUser } from '../entities/User';
import { AppError, AuthTokens, UserRole } from '../types';
import { JWTUtil } from '../utils/jwt';
import { env } from '../config/env';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<IUser, 'password' | 'refreshTokens'>;
  tokens: AuthTokens;
}

export class AuthService {
  private userRepository: UserRepository;
  private socketService: SocketService;

  constructor() {
    this.userRepository = new UserRepository();
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

  async register(data: RegisterData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || UserRole.USER,
    });

    // Generate tokens
    const tokens = JWTUtil.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    await this.userRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);

    // Remove sensitive data
    const userResponse = user.toJSON();

    // Emit real-time event for new user registration
    const socketService = this.getSocketService();
    if (socketService) {
      await socketService.notifyUserRegistered(userResponse);
    }

    return {
      user: userResponse,
      tokens,
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = JWTUtil.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token and update last login
    await Promise.all([
      this.userRepository.addRefreshToken(user._id.toString(), tokens.refreshToken),
      this.userRepository.updateLastLogin(user._id.toString()),
    ]);

    // Remove sensitive data
    const userResponse = user.toJSON();

    return {
      user: userResponse,
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);
      
      // Find user with refresh tokens
      const user = await this.userRepository.findByIdWithRefreshTokens(decoded.userId);
      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Check if refresh token exists in user's tokens
      if (!user.refreshTokens.includes(refreshToken)) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new AppError('Your account has been deactivated. Please contact support.', 401);
      }

      // Generate new tokens
      const tokens = JWTUtil.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Replace old refresh token with new one
      await Promise.all([
        this.userRepository.removeRefreshToken(user._id.toString(), refreshToken),
        this.userRepository.addRefreshToken(user._id.toString(), tokens.refreshToken),
      ]);

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Remove the specific refresh token
    await this.userRepository.removeRefreshToken(userId, refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    // Clear all refresh tokens
    await this.userRepository.clearRefreshTokens(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword('');
    const userWithPassword = await this.userRepository.findByIdWithRefreshTokens(userId);
    
    if (!userWithPassword) {
      throw new AppError('User not found', 404);
    }

    // Get user with password for verification
    const userForPasswordCheck = await this.userRepository.findByEmailWithPassword(userWithPassword.email);
    if (!userForPasswordCheck) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await userForPasswordCheck.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    userForPasswordCheck.password = newPassword;
    await userForPasswordCheck.save();

    // Clear all refresh tokens to force re-login
    await this.userRepository.clearRefreshTokens(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link
    
    // For now, we'll just log it
    console.log(`Password reset requested for: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // In a real application, you would:
    // 1. Verify the reset token
    // 2. Check if it's not expired
    // 3. Find user by token
    // 4. Update password
    // 5. Clear the reset token
    
    throw new AppError('Password reset functionality not implemented', 501);
  }

  async createDefaultAdmin(): Promise<void> {
    // Check if admin already exists
    const adminExists = await this.userRepository.findByEmail(env.ADMIN_EMAIL);
    if (adminExists) {
      return;
    }

    // Create default admin
    await this.userRepository.createAdmin({
      name: 'System Administrator',
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    });

    console.log('Default admin created successfully');
  }
}
