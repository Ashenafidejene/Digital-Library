import { useState, useEffect } from 'react';
import dashboardService, {
  DashboardOverview as DashboardOverviewType,
  BorrowedBook,
  ReservedBook,
  ReadingHistoryRecord
} from '../services/dashboardService';
import { Announcement, TabType } from '../types/dashboard';

export const useDashboardData = (activeTab: TabType) => {
  const [overviewData, setOverviewData] = useState<DashboardOverviewType | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (activeTab) {
          case 'overview':
            // Add a cache-busting parameter to the API call
            const overview = await dashboardService.getOverview();
            setOverviewData(overview);
            break;
          case 'books':
            // Books data will be loaded when books management is implemented
            break;
          case 'users':
            // Users data will be loaded when user management is implemented
            break;
          case 'borrowing':
            const borrowed = await dashboardService.getBorrowedBooks();
            setBorrowedBooks(borrowed);
            const reserved = await dashboardService.getReservedBooks();
            setReservedBooks(reserved);
            break;
          case 'announcements':
            const response = await fetch('/api/v1/admin/announcements');
            const announcementsData = await response.json();
            console.log('📢 Announcements API Response:', announcementsData);

            if (announcementsData.success) {
              // Handle both paginated and direct response structures
              let announcements = [];
              if (announcementsData.data && announcementsData.data.data && Array.isArray(announcementsData.data.data)) {
                announcements = announcementsData.data.data;
              } else if (Array.isArray(announcementsData.data)) {
                announcements = announcementsData.data;
              }
              setAnnouncements(announcements);
            }
            break;
          case 'events':
            // Events data will be loaded when events management is implemented
            break;
          case 'settings':
            // Settings data comes from various sources
            break;
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  return {
    overviewData,
    borrowedBooks,
    reservedBooks,
    readingHistory,
    announcements,
    loading,
    error,
    setOverviewData,
    setBorrowedBooks,
    setReservedBooks,
    setReadingHistory,
    setAnnouncements
  };
};
