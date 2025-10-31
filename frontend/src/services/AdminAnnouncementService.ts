import { apiService, ApiResponse } from './api';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  expiryDate?: string;
  authorId: string;
  authorName: string;
  targetAudience: 'all' | 'members' | 'staff';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = '/admin'; // `apiService` already has baseURL, so we can shorten this

export const AdminAnnouncementService = {
  // ✅ Get announcements with query params
  async getAnnouncements(params: Record<string, string>): Promise<ApiResponse<Announcement[]>> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${API_URL}/announcements${queryString ? `?${queryString}` : ''}`;

    return apiService.get(endpoint);
  },

  // ✅ Add a new announcement
  async addAnnouncement(announcementData: Omit<Announcement, 'id' | 'status' | 'publishDate' | 'image'> & { image?: File }): Promise<ApiResponse<Announcement>> {
    const formData = new FormData();
    Object.entries(announcementData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        formData.append('image', value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });
    return apiService.post(`${API_URL}/announcements`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ✅ Update an announcement
  async updateAnnouncement(announcementId: string, announcementData: Omit<Partial<Announcement>, 'image'> & { image?: File }): Promise<ApiResponse<Announcement>> {
    const formData = new FormData();
    Object.entries(announcementData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        formData.append('image', value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });
    return apiService.put(`${API_URL}/announcements/${announcementId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
