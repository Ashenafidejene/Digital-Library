import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Announcement } from '../../types/dashboard';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  loading: boolean;
  onCreateAnnouncement: () => void;
  onEditAnnouncement: (announcementId: string) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
  onToggleStatus: (announcementId: string, currentStatus: 'draft' | 'published' | 'archived' | 'active') => void;
}

const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  loading,
  onCreateAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onToggleStatus
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner w-8 h-8 mr-4"></div>
        <span className="text-neutral-600 dark:text-neutral-400">Loading announcements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Announcements Management
        </h2>
        <button
          onClick={onCreateAnnouncement}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Announcement</span>
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No Announcements
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Create your first announcement to keep users informed.
          </p>
          <button
            onClick={onCreateAnnouncement}
            className="btn-primary"
          >
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {announcement.title}
                    </h3>
                    <div className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${announcement.priority === 'high' || announcement.priority === 'urgent'
                        ? 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                        : announcement.priority === 'medium'
                        ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400'
                        : 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400'
                      }
                    `}>
                      {announcement.priority}
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.expiresAt && (
                      <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                    )}
                    <div className={`
                      inline-flex items-center px-2 py-1 rounded text-xs
                      ${announcement.status === 'active' || announcement.status === 'published'
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
                      }
                    `}>
                      {announcement.status}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => onEditAnnouncement(announcement.id)}
                    className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
                  >
                    <PencilIcon className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteAnnouncement(announcement.id)}
                    className="btn-danger text-xs px-3 py-1 flex items-center space-x-1"
                  >
                    <TrashIcon className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => onToggleStatus(announcement.id, announcement.status)}
                    className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
                  >
                    <span>{announcement.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;
