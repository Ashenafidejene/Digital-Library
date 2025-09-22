// Common types and interfaces for the application

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  category?: string;
  status?: string;
}

// User related types
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending'
}

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// Book related types
export enum BookStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance'
}

export interface BookQuery extends SearchQuery {
  author?: string;
  category?: string;
  status?: BookStatus;
}

// Booking related types
export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  OVERDUE = 'overdue'
}

export interface BookingQuery extends PaginationQuery {
  userId?: string;
  bookId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

// JWT Token types
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Socket.IO event types
export interface SocketEvents {
  // Booking events
  bookingCreated: (booking: any) => void;
  bookingUpdated: (booking: any) => void;
  bookingApproved: (booking: any) => void;
  bookingRejected: (booking: any) => void;
  
  // Book events
  bookAvailabilityChanged: (book: any) => void;
  
  // User events
  userStatusChanged: (user: any) => void;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Database connection types
export interface DatabaseConfig {
  uri: string;
  options?: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    family?: number;
  };
}

// Environment configuration
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  LOG_FILE: string;
  SOCKET_CORS_ORIGIN: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}
