import { apiService, ApiResponse } from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  status: 'upcoming' | 'past' | 'cancelled';
  image?: string;
}

export const AdminEventService = {
  getAllEvents: async (): Promise<ApiResponse<Event[]>> => {
    return apiService.get('/admin/events');
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'status' | 'image'> & { image?: File }): Promise<ApiResponse<Event>> => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        formData.append('image', value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });
    return apiService.post('/admin/events', formData);
  },

  updateEvent: async (eventId: string, eventData: Partial<Omit<Event, 'id' | 'image'>> & { image?: File }): Promise<ApiResponse<Event>> => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        formData.append('image', value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });
    return apiService.put(`/admin/events/${eventId}`, formData);
  },

  deleteEvent: async (eventId: string): Promise<ApiResponse<any>> => {
    return apiService.delete(`/admin/events/${eventId}`);
  },
};
