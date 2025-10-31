import { apiService, ApiResponse } from './api';

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  image?: string;
}

export const UserEventAndAnnouncementService = {
  getAllEvents: async (): Promise<ApiResponse<Event[]>> => {
    return apiService.get('/events');
  },

  getAllAnnouncements: async (): Promise<ApiResponse<Announcement[]>> => {
    return apiService.get('/announcements');
  },
};
