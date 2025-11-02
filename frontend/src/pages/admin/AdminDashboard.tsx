import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TabType, NotificationSettings } from '../../types/dashboard';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardActions } from '../../hooks/useDashboardActions';

// Components
import DashboardNavigation from '../../components/admin/DashboardNavigation';
import DashboardOverview from '../../components/admin/DashboardOverview';
import AdminBorrowingPage from './AdminBorrowingPage';
import AnnouncementsTab from '../../components/admin/AnnouncementsTab';
import ProfileTab from '../../components/admin/ProfileTab';
import SimpleAddBookModal from '../../components/admin/SimpleAddBookModal';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    overdueAlerts: true,
    weeklyReports: true
  });
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  // Custom hooks
  const {
    overviewData,
    borrowedBooks,
    reservedBooks,
    readingHistory,
    announcements,
    loading,
    error
  } = useDashboardData(activeTab);

  const {
    actionLoading,
    handleSendReminder,
    handleRenewBook,
    handleReturnBook,
    handleCancelReservation,
    handleIssueBook,
    handleCreateAnnouncement,
    handleEditAnnouncement,
    handleDeleteAnnouncement,
    handleToggleAnnouncementStatus
  } = useDashboardActions();

  // Helper functions
  const handleShowAddBookModal = () => setShowAddBookModal(true);
  const handleCloseAddBookModal = () => setShowAddBookModal(false);

  // Handle book submission
  const handleAddBookSubmit = async (bookData: any) => {
    try {
      console.log('📚 Original book data:', bookData);

      const token = localStorage.getItem('accessToken');
      console.log('📚 Auth token exists:', !!token);
      console.log('📚 Auth token value:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('📚 User info:', user);
      console.log('📚 User role:', user?.role);

      if (!token) {
        alert('You are not logged in. Please log in first.\n\nFor testing, I will create a test admin token.');
        // For testing purposes, create a mock token
        const testToken = 'test-admin-token-' + Date.now();
        localStorage.setItem('accessToken', testToken);
        console.log('📚 Created test token:', testToken);
      }

      if (!user) {
        console.log('📚 No user found, proceeding with test mode');
      }

      // Transform data to match backend expectations
      const transformedData = {
        title: bookData.title?.trim(),
        author: bookData.author?.trim(),
        description: bookData.description && bookData.description.trim().length >= 10
          ? bookData.description.trim()
          : 'No description provided', // Required, min 10 chars
        category: bookData.category,
        code: bookData.code?.trim() || `BK-${Date.now()}`, // Add unique code field
        isbn: bookData.isbn && bookData.isbn.trim() ? bookData.isbn.trim() : undefined,
        publisher: bookData.publisher || undefined,
        publishedDate: bookData.publicationDate ? new Date(bookData.publicationDate) : undefined,
        pageCount: bookData.pages ? parseInt(bookData.pages.toString()) : undefined,
        language: bookData.language || 'English',
        tags: [],
        coverImage: undefined,
        availability: {
          totalCopies: parseInt(bookData.totalCopies?.toString() || '1'),
          availableCopies: parseInt(bookData.totalCopies?.toString() || '1'),
        },
        location: {
          shelf: bookData.shelfNumber?.trim() || 'A-1',
          section: bookData.section?.trim() || 'General', // Use section from form
          floor: 'Ground Floor',
        },
      };

      console.log('📚 Transformed book data:', transformedData);

      // Validate required fields before sending
      if (!transformedData.title || !transformedData.author || !transformedData.category) {
        alert('Title, Author, and Category are required fields');
        return;
      }

      if (!transformedData.location.shelf || !transformedData.location.section) {
        alert('Shelf location and Section are required fields');
        return;
      }

      if (transformedData.availability.totalCopies < 1) {
        alert('Total copies must be at least 1');
        return;
      }

      const response = await fetch('/api/v1/admin/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transformedData),
      });

      console.log('📚 Response status:', response.status);
      const result = await response.json();
      console.log('📚 Add book response:', result);

      if (response.ok && result.success) {
        alert('Book added successfully!');
        handleCloseAddBookModal();
      } else {
        console.error('📚 Backend error:', result);
        if (response.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          // Show detailed validation errors
          let errorMessage = 'Validation error:\n';
          if (result.errors && Array.isArray(result.errors)) {
            errorMessage += result.errors.map((err: any) => `• ${err.msg || err.message}`).join('\n');
          } else {
            errorMessage += result.message || 'Please check all required fields';
          }
          alert(errorMessage);
        } else {
          alert(`Failed to add book: ${result.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('📚 Network error:', error);
      alert('Failed to add book. Please check your connection and try again.');
    }
  };

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">Error</div>
            <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>

        {/* Content */}
        {activeTab === 'overview' && (
          <DashboardOverview
            overviewData={overviewData}
            loading={loading}
            onIssueBook={handleIssueBook}
            onShowAddBookModal={handleShowAddBookModal}
          />
        )}

        {activeTab === 'books' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Manage Books
              </h2>
              <button
                onClick={handleShowAddBookModal}
                className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Add New Book</span>
              </button>
            </div>
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Books management interface will be implemented here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Manage Users
              </h2>
              <button className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base">
                <span>Add New User</span>
              </button>
            </div>
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                User management interface will be implemented here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'borrowing' && <AdminBorrowingPage />}

        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            loading={loading}
            onCreateAnnouncement={handleCreateAnnouncement}
            onEditAnnouncement={handleEditAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onToggleStatus={handleToggleAnnouncementStatus}
          />
        )}

        {activeTab === 'events' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Events Management
              </h2>
              <button className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base">
                <span>Create New Event</span>
              </button>
            </div>
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Events management interface will be implemented here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              System Settings
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Library Settings */}
              <div className="card">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
                  Library Settings
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Library Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Yeka Sub-City Library"
                      className="input-field text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Default Loan Period (days)
                    </label>
                    <input
                      type="number"
                      defaultValue="14"
                      className="input-field text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* User Profile Settings */}
              <div className="card">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
                  Admin Profile
                </h3>
                <ProfileTab
                  user={user}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </div>
            </div>
          </div>
        )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <SimpleAddBookModal
          isOpen={showAddBookModal}
          onClose={handleCloseAddBookModal}
          onSubmit={handleAddBookSubmit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
