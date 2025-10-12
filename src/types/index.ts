import AppError from '../utils/AppError';
import { UserRole } from './enums';

export * from './enums';
export { AppError };

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  sessionId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
