import { apiService, ApiResponse, PaginatedApiResponse } from './api';

export interface Booking {
  id: string;
  userId: string;
  bookId: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue' | 'borrowed';
  requestDate: string;
  dueDate?: string;
  returnDate?: string;
  [key: string]: any;
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const bookingService = {
  async createBooking(bookId: string, borrowPeriodDays?: number): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>('/bookings', { bookId, borrowPeriodDays });
  },

  async getUserBookings(query: BookingQuery = {}): Promise<PaginatedApiResponse<Booking>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    return apiService.get<any>(`/bookings/my?${params.toString()}`) as unknown as PaginatedApiResponse<Booking>;
  },

  async approveBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${id}/approve`, {});
  },

  async rejectBooking(id: string, reason: string): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${id}/reject`, { reason });
  },

  async returnBook(id: string): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${id}/return`, {});
  },
};
