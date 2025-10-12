import { apiService, ApiResponse } from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  status: 'upcoming' | 'past' | 'cancelled';
}

export const AdminEventService = {
  getAllEvents: async (): Promise<ApiResponse<Event[]>> => {
    return apiService.get('/admin/events');
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'status'>): Promise<ApiResponse<Event>> => {
    return apiService.post('/admin/events', eventData);
  },

  updateEvent: async (eventId: string, eventData: Partial<Omit<Event, 'id'>>): Promise<ApiResponse<Event>> => {
    return apiService.put(`/admin/events/${eventId}`, eventData);
  },

  deleteEvent: async (eventId: string): Promise<ApiResponse<any>> => {
    return apiService.delete(`/admin/events/${eventId}`);
  },
};
