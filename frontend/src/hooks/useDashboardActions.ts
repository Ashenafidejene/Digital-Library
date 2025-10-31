import { useState } from 'react';
import dashboardService from '../services/dashboardService';

export const useDashboardActions = () => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSendReminder = async (bookId: string) => {
    setActionLoading(`reminder-${bookId}`);
    try {
      await dashboardService.sendReminder(bookId);
      alert('Reminder sent successfully!');
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewBook = async (bookId: string) => {
    setActionLoading(`renew-${bookId}`);
    try {
      await dashboardService.renewBook(bookId);
      alert('Book renewed successfully!');
      // Refresh the page or update state
      window.location.reload();
    } catch (err) {
      console.error('Error renewing book:', err);
      alert('Failed to renew book. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnBook = async (bookId: string) => {
    setActionLoading(`return-${bookId}`);
    try {
      await dashboardService.returnBook(bookId);
      alert('Book returned successfully!');
      // Refresh the page or update state
      window.location.reload();
    } catch (err) {
      console.error('Error returning book:', err);
      alert('Failed to return book. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelReservation = async (bookId: string) => {
    setActionLoading(`cancel-${bookId}`);
    try {
      await dashboardService.cancelReservation(bookId);
      alert('Reservation cancelled successfully!');
      // Refresh the page or update state
      window.location.reload();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert('Failed to cancel reservation. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleIssueBook = () => {
    alert('Issue Book functionality - This would open a book issuing form');
  };

  const handleCreateAnnouncement = () => {
    alert('Create Announcement functionality - This would open an announcement form');
  };

  const handleEditAnnouncement = (announcementId: string) => {
    alert(`Edit Announcement functionality for announcement ID: ${announcementId}`);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      alert(`Announcement ${announcementId} deleted successfully!`);
    }
  };

  const handleToggleAnnouncementStatus = (announcementId: string, currentStatus: 'draft' | 'published' | 'archived' | 'active') => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    alert(`Toggling status of announcement ${announcementId} to ${newStatus}`);
  };

  return {
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
  };
};
