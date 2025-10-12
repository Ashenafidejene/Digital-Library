import { Announcement } from '../pages/admin/AdminAnnouncementsPage';
import { apiService, ApiResponse } from './api';

const API_URL = '/admin'; // `apiService` already has baseURL, so we can shorten this

export const AdminAnnouncementService = {
  // ✅ Get announcements with query params
  async getAnnouncements(params: Record<string, string>): Promise<Announcement[]> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${API_URL}/announcements${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<Announcement[]>(endpoint);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch announcements');
    }
    return response.data;
  },

  // ✅ Add a new announcement
  async addAnnouncement(announcementData: Partial<Announcement>): Promise<Announcement> {
    const response = await apiService.post<Announcement>(
      `${API_URL}/announcements`,
      announcementData
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to create announcement');
    }
    return response.data;
  },

  // ✅ Delete announcement
  async deleteAnnouncement(announcementId: string): Promise<void> {
    const response = await apiService.delete<void>(
      `${API_URL}/announcements/${announcementId}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete announcement');
    }
  },

  // ✅ Toggle status (published ↔ draft)
  async toggleAnnouncementStatus(
    announcementId: string,
    currentStatus: string
  ): Promise<Announcement> {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    const response = await apiService.put<Announcement>(
      `${API_URL}/announcements/${announcementId}/status`,
      { status: newStatus }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to update status');
    }
    return response.data;
  },
};
