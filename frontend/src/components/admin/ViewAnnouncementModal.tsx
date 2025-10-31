import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Announcement } from '../../services/AdminAnnouncementService';

interface ViewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

const ViewAnnouncementModal: React.FC<ViewAnnouncementModalProps> = ({ 
  isOpen, 
  onClose, 
  announcement 
}) => {
  if (!isOpen || !announcement) return null;

  const getTypeColor = (type: Announcement['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Announcement['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 font-bold';
      case 'high':
        return 'text-orange-600 font-semibold';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {announcement.title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(announcement.type)}`}>
              {announcement.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(announcement.status)}`}>
              {announcement.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(announcement.priority)}`}>
              {announcement.priority} priority
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {announcement.targetAudience}
            </span>
          </div>

          {announcement.image && (
            <div className="my-4">
              <img src={announcement.image} alt={announcement.title} className="w-full h-auto rounded-lg" />
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Content</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Author</h3>
              <p className="text-neutral-800 dark:text-neutral-200">{announcement.authorName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Target Audience</h3>
              <p className="text-neutral-800 dark:text-neutral-200 capitalize">{announcement.targetAudience}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Publish Date</h3>
              <p className="text-neutral-800 dark:text-neutral-200">{formatDate(announcement.publishDate)}</p>
            </div>
            {announcement.expiryDate && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Expiry Date</h3>
                <p className="text-neutral-800 dark:text-neutral-200">{formatDate(announcement.expiryDate)}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Created</h3>
              <p className="text-neutral-800 dark:text-neutral-200">{formatDate(announcement.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Last Updated</h3>
              <p className="text-neutral-800 dark:text-neutral-200">{formatDate(announcement.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAnnouncementModal;
