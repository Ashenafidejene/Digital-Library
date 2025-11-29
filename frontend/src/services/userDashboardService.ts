import { apiRequest, ApiResponse } from './api';
import { Book } from './bookService';

// Data interfaces for User Dashboard
export interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  dueDate: string;
  status: 'borrowed' | 'overdue' | 'renewed';
  renewalsLeft: number;
  coverImage?: string;
}

export interface ReservedBook {
  id: string;
  title: string;
  author: string;
  reservedDate: string;
  estimatedAvailability: string;
  position: number;
  coverImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue';
  borrowPeriodDays: number;
}

export interface ReadingHistory {
  id: string;
  title: string;
  author: string;
  borrowedDate: string;
  returnedDate: string;
  rating?: number;
  coverImage?: string;
}

export interface Notification {
  id: string;
  type: 'due_soon' | 'overdue' | 'available' | 'reminder' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserDashboardData {
  borrowedBooks: BorrowedBook[];
  reservedBooks: ReservedBook[];
  readingHistory: ReadingHistory[];
  notifications: Notification[];
  favoriteBooks: Book[];
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// User Dashboard API service
export const userDashboardService = {
  async getDashboardData(): Promise<UserDashboardData> {
    const response = await apiRequest<UserDashboardData>('/dashboard/overview');
    return response.data;
  },

  async getBorrowedBooks(): Promise<ApiResponse<BorrowedBook[]>> {
    return apiRequest<BorrowedBook[]>('/dashboard/borrowed-books');
  },

  async getReservedBooks(): Promise<ApiResponse<ReservedBook[]>> {
    return apiRequest<ReservedBook[]>('/dashboard/reserved-books');
  },

  async getReadingHistory(): Promise<ApiResponse<ReadingHistory[]>> {
    return apiRequest<ReadingHistory[]>('/dashboard/reading-history');
  },

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiRequest<Notification[]>('/dashboard/notifications');
  },

  async getFavoriteBooks(): Promise<ApiResponse<Book[]>> {
    return apiRequest<Book[]>('/dashboard/favorite-books');
  },

  async toggleFavorite(bookId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/users/books/${bookId}/favorite`, {
      method: 'POST',
    });
    return response;
  },

  async renewBook(bookingId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/renew-book/${bookingId}`, {
      method: 'POST',
    });
    return response;
  },

  async cancelReservation(bookingId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/cancel-reservation/${bookingId}`, {
      method: 'POST',
    });
    return response;
  },
  
  async rateBook(bookingId: string, rating: number): Promise<ActionResponse> {
    const response = await apiRequest<any>(`/bookings/${bookingId}/rate`, {
        method: 'PUT',
        body: JSON.stringify({ rating }),
    });
    return { success: response.success, message: response.message, data: response.data };
  },

  async markNotificationAsRead(notificationId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/user/notifications/${notificationId}/read`, {
        method: 'POST',
    });
    return response;
  }
};

export default userDashboardService;
