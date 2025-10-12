import { console } from 'inspector';
import { apiRequest } from './api';

// Dashboard data interfaces
export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  borrowedBooks: number;
  overdueBooks: number;
  reservedBooks: number;
  newMembersThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: 'borrow' | 'return' | 'reserve';
  user: string;
  book: string;
  timestamp: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
}

export interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  borrowDate: string;
  dueDate: string;
  status: 'active' | 'overdue' | 'returned';
  renewalCount: number;
  maxRenewals: number;
}

export interface ReservedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  reserverName: string;
  reserverEmail: string;
  reserverPhone: string;
  reservedDate: string;
  estimatedAvailability: string;
  position: number;
  status: 'pending' | 'ready' | 'expired';
}

export interface ReadingHistoryRecord {
  id: string;
  title: string;
  author: string;
  isbn: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowDate: string;
  returnDate: string;
  rating?: number;
  status: 'completed' | 'overdue_returned';
  daysOverdue: number;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data: any;
}

// Dashboard API service
export const dashboardService = {
  // Get dashboard overview data
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiRequest<DashboardOverview>('/dashboard/overview');
    
    return response.data;
  },

  // Get dashboard charts data
  async getChartsData(): Promise<any> {
    const response = await apiRequest<any>('/dashboard/charts');
    return response.data;
  },

  // Get borrowed books data
  async getBorrowedBooks(): Promise<BorrowedBook[]> {
    const response = await apiRequest<BorrowedBook[]>('/dashboard/borrowed-books');
    return response.data;
  },

  // Get reserved books data
  async getReservedBooks(): Promise<ReservedBook[]> {
    const response = await apiRequest<ReservedBook[]>('/dashboard/reserved-books');
    return response.data;
  },

  // Get reading history data
  async getReadingHistory(): Promise<ReadingHistoryRecord[]> {
    const response = await apiRequest<ReadingHistoryRecord[]>('/dashboard/reading-history');
    return response.data;
  },

  // Send reminder for overdue book
  async sendReminder(bookId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/send-reminder/${bookId}`, {
      method: 'POST'
    });
    return response;
  },

  // Renew book
  async renewBook(bookId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/renew-book/${bookId}`, {
      method: 'POST'
    });
    return response;
  },

  // Return book
  async returnBook(bookId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/return-book/${bookId}`, {
      method: 'POST'
    });
    return response;
  },

  // Mark book as returned (legacy method)
  async markReturned(bookId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/mark-returned/${bookId}`, {
      method: 'POST'
    });
    return response;
  },

  // Notify user about reservation
  async notifyUser(reservationId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/notify-user/${reservationId}`, {
      method: 'POST'
    });
    return response;
  },

  // Cancel reservation
  async cancelReservation(reservationId: string): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>(`/dashboard/cancel-reservation/${reservationId}`, {
      method: 'POST'
    });
    return response;
  },

  // Update profile
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    notifications?: {
      emailNotifications: boolean;
      overdueAlerts: boolean;
      weeklyReports: boolean;
    };
  }): Promise<ActionResponse> {
    const response = await apiRequest<ActionResponse>('/dashboard/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return response;
  },

  // Generate report
  async generateReport(): Promise<any> {
    const response = await apiRequest<any>('/dashboard/generate-report');
    return response.data;
  }
};

export default dashboardService;
