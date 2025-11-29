import { HandRaisedIcon } from '@heroicons/react/24/outline';
import { apiService, ApiResponse } from './api';
// Enhanced User interface with borrowing and booking details
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  membershipType: 'basic' | 'premium' | 'student';
  joinDate: string;
  lastActive: string;
  borrowedBooks: number;
  totalBorrows: number;
  overdueBooks?: number;
  pendingBookings?: number;
  clearanceStatus?: 'clear' | 'pending' | 'blocked';
  currentBorrowings?: BorrowedBook[];
  pendingRequests?: BookingRequest[];
}
// Borrowed book details
export interface BorrowedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowDate: string;
  dueDate: string;
  daysLeft: number;
  status: 'active' | 'overdue' | 'renewed';
  renewalCount: number;
  maxRenewals: number;
}
// Booking request details
export interface BookingRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: number;
}
// Raw borrowing record from API (before processing)
export interface RawBorrowingRecord {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowDate: string | null;
  dueDate: string | null;
  returnDate: string | null;
  status: 'active' | 'borrowed' | 'pending' | 'returned' | 'overdue' | 'approved';
  renewalCount: number;
  maxRenewals: number;
  requestDate: string;
  priority?: number;
}
// API Response structure for borrowing data
export interface BorrowingApiResponse {
  success: boolean;
  data: RawBorrowingRecord[];
  message?: string;
}

// API response for paginated borrowing records
export interface PaginatedBorrowingResponse {
  records: RawBorrowingRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API response for paginated users
export interface PaginatedUsersResponse {
  users?: User[];
  data?: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const userService = {
  async getUsers(
    query: Record<string, string | number | undefined> = {}
  ): Promise<ApiResponse<PaginatedUsersResponse>> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return apiService.get<PaginatedUsersResponse>(`/users?${params.toString()}`);
  },

  async getBorrowingRecords(): Promise<ApiResponse<PaginatedBorrowingResponse>> {
    return apiService.get<PaginatedBorrowingResponse>(`/bookings`);
  },

  async addAdmin(adminData: { name: string; email: string; phone?: string }): Promise<ApiResponse<User>> {
    return apiService.post<User>(`/auth/register`, {
      ...adminData,
      password: 'Admin@123',
      role: 'admin'
    });
  },

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/users/${userId}`);
  },

  async issueBook(userId: string, bookId: string, dueDate: string): Promise<ApiResponse<any>> {
    return apiService.post(`/bookings`, {
      bookId,
      userId,
      dueDate,
    });
  },

  async returnBook(borrowingId: string): Promise<ApiResponse<any>> {
    return apiService.post(`/bookings/${borrowingId}/return`);
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.put(`/admin/users/${userId}/reset-password`, { newPassword });
  },
}
