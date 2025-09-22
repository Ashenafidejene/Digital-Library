import { UserRepository } from '../repositories/UserRepository';
import { IUser } from '../entities/User';
import { AppError, UserRole, UserStatus, PaginationQuery } from '../types';
import { PaginationUtil } from '../utils/pagination';

export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    favoriteCategories?: string[];
  };
}

export interface UserQuery extends PaginationQuery {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<IUser> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // If email is being updated, check if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.userRepository.exists(updateData.email);
      if (emailExists) {
        throw new AppError('Email is already taken', 409);
      }
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete user', 500);
    }
  }

  async getAllUsers(query: UserQuery) {
    const result = await this.userRepository.findAll(query);
    return result;
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await this.userRepository.updateStatus(id, status);
    if (!updatedUser) {
      throw new AppError('Failed to update user status', 500);
    }

    return updatedUser;
  }

  async blockUser(id: string): Promise<IUser> {
    return this.updateUserStatus(id, UserStatus.BLOCKED);
  }

  async unblockUser(id: string): Promise<IUser> {
    return this.updateUserStatus(id, UserStatus.ACTIVE);
  }

  async getUserStats() {
    const [activeUsers, blockedUsers, pendingUsers, adminUsers] = await Promise.all([
      this.userRepository.countByStatus(UserStatus.ACTIVE),
      this.userRepository.countByStatus(UserStatus.BLOCKED),
      this.userRepository.countByStatus(UserStatus.PENDING),
      this.userRepository.countByRole(UserRole.ADMIN),
    ]);

    const totalUsers = activeUsers + blockedUsers + pendingUsers;

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
    };
  }

  async searchUsers(searchTerm: string, query: PaginationQuery) {
    const searchQuery: UserQuery = {
      ...query,
      search: searchTerm,
    };

    return this.getAllUsers(searchQuery);
  }

  async getUsersByRole(role: UserRole, query: PaginationQuery) {
    const roleQuery: UserQuery = {
      ...query,
      role,
    };

    return this.getAllUsers(roleQuery);
  }

  async getUsersByStatus(status: UserStatus, query: PaginationQuery) {
    const statusQuery: UserQuery = {
      ...query,
      status,
    };

    return this.getAllUsers(statusQuery);
  }

  async updateUserPreferences(
    id: string,
    preferences: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      favoriteCategories?: string[];
    }
  ): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: UpdateUserData = {
      preferences: {
        ...user.preferences,
        ...preferences,
      },
    };

    return this.updateUser(id, updateData);
  }

  async addFavoriteCategory(id: string, category: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const favoriteCategories = user.preferences?.favoriteCategories || [];
    if (!favoriteCategories.includes(category)) {
      favoriteCategories.push(category);
    }

    return this.updateUserPreferences(id, { favoriteCategories });
  }

  async removeFavoriteCategory(id: string, category: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const favoriteCategories = (user.preferences?.favoriteCategories || [])
      .filter(cat => cat !== category);

    return this.updateUserPreferences(id, { favoriteCategories });
  }

  async validateUserAccess(userId: string, requestingUserId: string, requestingUserRole: UserRole): Promise<void> {
    // Admin can access any user
    if (requestingUserRole === UserRole.ADMIN) {
      return;
    }

    // Users can only access their own data
    if (userId !== requestingUserId) {
      throw new AppError('You can only access your own data', 403);
    }
  }
}
