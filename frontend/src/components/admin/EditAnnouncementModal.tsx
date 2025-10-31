import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Announcement } from '../../services/AdminAnnouncementService';

interface EditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateAnnouncement: (id: string, data: Omit<Partial<Announcement>, 'image'> & { image?: File }) => Promise<void>;
  announcement: Announcement | null;
}

const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdateAnnouncement, 
  announcement 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as Announcement['type'],
    priority: 'medium' as Announcement['priority'],
    status: 'draft' as Announcement['status'],
    targetAudience: 'all' as Announcement['targetAudience'],
    publishDate: '',
    expiryDate: '',
    image: '',
  });

  const [image, setImage] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        status: announcement.status,
        targetAudience: announcement.targetAudience,
        publishDate: announcement.publishDate ? new Date(announcement.publishDate).toISOString().slice(0, 16) : '',
        expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().slice(0, 16) : '',
        image: announcement.image || '',
      });
      if (announcement.image) {
        setImagePreview(announcement.image);
      }
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;

    setLoading(true);
    try {
      const { image: _, ...restFormData } = formData;
      const updateData: Omit<Partial<Announcement>, 'image'> & { image?: File } = {
        ...restFormData,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
      };
      
      if (image) {
        updateData.image = image;
      }

      await onUpdateAnnouncement(announcement.id, updateData);
      onClose();
    } catch (error) {
      console.error('Failed to update announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Edit Announcement
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Target Audience
              </label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="all">All</option>
                <option value="members">Members</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="publishDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Publish Date
              </label>
              <input
                type="datetime-local"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="datetime-local"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-md" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncementModal;
