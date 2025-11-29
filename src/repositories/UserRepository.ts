import { User, IUser } from '../entities/User';
import { UserRole, UserStatus, PaginationQuery } from '../types';
import { PaginationUtil } from '../utils/pagination';
import mongoose from 'mongoose';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await User.findById(id).populate('favoriteBooks');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
  }

  async findByIdWithRefreshTokens(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await User.findById(id).select('+refreshTokens');
  }

  async findByResetToken(hashedToken: string): Promise<IUser | null> {
    return await User.findOne({ resetPasswordToken: hashedToken }).select('+resetPasswordToken +resetPasswordExpires');
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(query: PaginationQuery & { role?: UserRole; status?: UserStatus; search?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = PaginationUtil.parseQuery(query);
    
    // Build filter
    const filter: any = {};
    
    if (query.role) {
      filter.role = query.role;
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    // Build sort
    const sort = PaginationUtil.buildSortObject(sortBy, sortOrder);

    // Execute queries
    const [users, totalItems] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalItems, page, limit);

    return {
      users,
      pagination,
    };
  }

  async updateLastLogin(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }
    
    await User.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async addRefreshToken(id: string, token: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }
    
    await User.findByIdAndUpdate(
      id,
      { $push: { refreshTokens: token } }
    );
  }

  async removeRefreshToken(id: string, token: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }
    
    await User.findByIdAndUpdate(
      id,
      { $pull: { refreshTokens: token } }
    );
  }

  async clearRefreshTokens(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }
    
    await User.findByIdAndUpdate(
      id,
      { $set: { refreshTokens: [] } }
    );
  }

  async updateStatus(id: string, status: UserStatus): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return await User.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  async countByRole(role: UserRole): Promise<number> {
    return await User.countDocuments({ role });
  }

  async countByStatus(status: UserStatus): Promise<number> {
    return await User.countDocuments({ status });
  }

  async exists(email: string): Promise<boolean> {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  async createAdmin(adminData: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    const admin = new User({
      ...adminData,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    
    return await admin.save();
  }

  public async aggregate(pipeline: any[]): Promise<any[]> {
    return await (User as any).aggregate(pipeline);
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return await User.countDocuments(filter);
  }
}
