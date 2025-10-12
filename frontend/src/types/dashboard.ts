// Dashboard-specific types and interfaces

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived' | 'active';
  publishDate?: string;
  expiryDate?: string;
  createdAt: string;
  expiresAt?: string;
  authorId?: string;
  authorName?: string;
  targetAudience?: 'all' | 'members' | 'staff';
  updatedAt?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  overdueAlerts: boolean;
  weeklyReports: boolean;
}

export type TabType = 'overview' | 'books' | 'users' | 'borrowing' | 'announcements' | 'events' | 'settings';

export interface DashboardState {
  activeTab: TabType;
  loading: boolean;
  actionLoading: string | null;
  error: string | null;
  showAddBookModal: boolean;
}
