import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminAnnouncementService } from '../../services/AdminAnnouncementService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  SpeakerWaveIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import AddAnnouncementModal from '../../components/admin/AddAnnouncementModal';
import ViewAnnouncementModal from '../../components/admin/ViewAnnouncementModal';
import EditAnnouncementModal from '../../components/admin/EditAnnouncementModal';

// Announcement interface
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
  createdAt: string;
  updatedAt: string;
}

const AdminAnnouncementsPage: React.FC = () => {
  // State management
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { t } = useLanguage();

  /**
   * Fetch announcements from backend with search and filter parameters
   * Includes backend URL validation
   */
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params: { [key: string]: string } = { limit: '50' };
      if (searchQuery) params.search = searchQuery;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedType) params.type = selectedType;

      const announcementsData = await AdminAnnouncementService.getAnnouncements(params);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
      alert(`Error fetching announcements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedType]);

  /**
   * Add new announcement
   */
  const handleAddAnnouncement = async (title: string, content: string) => {
    try {
      // You might want to add more fields here based on your backend requirements
      const announcementData = {
        title,
        content,
        type: 'info' as 'info', // Default value
        priority: 'medium' as 'medium', // Default value
        status: 'draft' as 'draft', // Default value
        targetAudience: 'all' as 'all', // Default value
      };
      const newAnnouncement = await AdminAnnouncementService.addAnnouncement(announcementData);
      setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
      setIsAddModalOpen(false);
      alert('Announcement created successfully');
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert(`Failed to create announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Delete announcement
   */
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await AdminAnnouncementService.deleteAnnouncement(announcementId);
        setAnnouncements(announcements.filter(announcement => announcement.id !== announcementId));
        alert('Announcement deleted successfully');
      } catch (error) {
        console.error('Failed to delete announcement:', error);
        alert(`Failed to delete announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  /**
   * Toggle announcement status (publish/unpublish)
   */
  const handleToggleStatus = async (announcementId: string, currentStatus: string) => {
    try {
      const updatedAnnouncement = await AdminAnnouncementService.toggleAnnouncementStatus(announcementId, currentStatus);
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement =>
          announcement.id === announcementId ? updatedAnnouncement : announcement
        )
      );
      alert(`Announcement ${updatedAnnouncement.status === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Get type color classes for announcement type badges
   */
  const getTypeColor = (type: Announcement['type']) => {
    switch (type) {
      case 'info':
        return 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400';
      case 'warning':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'success':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'error':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  /**
   * Get status color classes for announcement status badges
   */
  const getStatusColor = (status: Announcement['status']) => {
    switch (status) {
      case 'published':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'draft':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'archived':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  /**
   * Get priority icon
   */
  const getPriorityIcon = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return ExclamationCircleIcon;
      case 'high':
        return ExclamationCircleIcon;
      default:
        return SpeakerWaveIcon;
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Truncate content for display
   */
  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAnnouncements();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [fetchAnnouncements]);

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('navigation.announcements')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage library announcements and notifications
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:w-40">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading announcements...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Announcement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                  {announcements?.map((announcement) => {
                    const PriorityIcon = getPriorityIcon(announcement.priority);
                    
                    return (
                      <motion.tr
                        key={announcement.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                <SpeakerWaveIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              </div>
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {announcement.title}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {truncateContent(announcement.content)}
                              </div>
                              <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                by {announcement.authorName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(announcement.type)}`}>
                            {announcement.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(announcement.status)}`}>
                            {announcement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <PriorityIcon className={`w-4 h-4 mr-2 ${
                              announcement.priority === 'urgent' ? 'text-error-500' :
                              announcement.priority === 'high' ? 'text-warning-500' :
                              'text-neutral-400'
                            }`} />
                            <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">
                              {announcement.priority}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          <div>Published: {formatDate(announcement.publishDate)}</div>
                          {announcement.expiryDate && (
                            <div className="text-xs text-neutral-500">
                              Expires: {formatDate(announcement.expiryDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="text-neutral-600 dark:text-neutral-400 hover:text-warning-600 dark:hover:text-warning-400 transition-colors duration-200"
                              title="Edit Announcement"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                              className={`transition-colors duration-200 ${
                                announcement.status === 'published'
                                  ? 'text-warning-600 hover:text-warning-700'
                                  : 'text-success-600 hover:text-success-700'
                              }`}
                              title={announcement.status === 'published' ? 'Unpublish' : 'Publish'}
                            >
                              <CalendarDaysIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors duration-200"
                              title="Delete Announcement"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {(announcements?.length === 0) && !loading && (
              <div className="text-center py-12">
                <FunnelIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No announcements found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {searchQuery || selectedStatus || selectedType
                    ? 'Try adjusting your search criteria'
                    : 'Start by creating your first announcement'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {announcements?.length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total Announcements
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {announcements?.filter(announcement => announcement.status === 'published').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Published
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {announcements?.filter(announcement => announcement.status === 'draft').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Drafts
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-error-600 dark:text-error-400">
            {announcements?.filter(announcement => announcement.priority === 'urgent').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Urgent
          </div>
        </div>
      </div>

      {/* Add Announcement Modal */}
      <AddAnnouncementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAnnouncement={handleAddAnnouncement}
      />
    </div>
  );
};

export default AdminAnnouncementsPage;
