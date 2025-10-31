import { apiService, ApiResponse } from './api';

export interface Event {
  _id?: string;
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export const eventService = {
  async getAllEvents(): Promise<ApiResponse<Event[]>> {
    return apiService.get<Event[]>('/events-announcements/events');
  },
};

export default eventService;
