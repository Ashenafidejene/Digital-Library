import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Event } from '../../services/AdminEventService';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (event: Event) => void;
  event: Event;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onUpdateEvent,
  event,
}) => {
  const [formData, setFormData] = useState<Event & { imageFile?: File }>(event);

  useEffect(() => {
    setFormData(event);
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Event</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows={4}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              type="datetime-local"
              name="date"
              id="date"
              value={new Date(formData.date).toISOString().slice(0, 16)}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="organizer" className="block text-sm font-medium">
              Organizer
            </label>
            <input
              type="text"
              name="organizer"
              id="organizer"
              value={formData.organizer}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium">
              Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              onChange={handleFileChange}
              className="input-field"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditEventModal;
