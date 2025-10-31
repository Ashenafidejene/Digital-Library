import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Announcement } from '../../services/AdminAnnouncementService';

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnnouncement: (announcementData: Omit<Announcement, 'id' | 'status' | 'publishDate' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName' | 'image'> & { image?: File }) => void;
}

const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ isOpen, onClose, onAddAnnouncement }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [targetAudience, setTargetAudience] = useState<'all' | 'members' | 'staff'>('all');
  const [expiryDate, setExpiryDate] = useState('');
  const [image, setImage] = useState<File | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAnnouncement({
      title,
      content,
      type,
      priority,
      targetAudience,
      expiryDate,
      image,
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{t('add_announcement')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('title')}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('content')}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field"
                rows={5}
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Type
              </label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} className="input-field">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Priority
              </label>
              <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as any)} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Target Audience
              </label>
              <select id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as any)} className="input-field">
                <option value="all">All</option>
                <option value="members">Members</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Image
              </label>
              <input
                type="file"
                id="image"
                onChange={(e) => setImage(e.target.files?.[0])}
                className="input-field"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncementModal;
