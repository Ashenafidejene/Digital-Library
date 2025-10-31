import { apiService, ApiResponse } from './api';

export interface Announcement {
  _id?: string;
  id: string;
  title: string;
  content: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  expiryDate?: string;
  image?: string;
  authorId: string;
  authorName: string;
  targetAudience: string[];
  createdAt: string;
  updatedAt: string;
}

export const announcementService = {
  async getAllAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    return apiService.get<Announcement[]>('/events-announcements/announcements');
  },
};

export default announcementService;
