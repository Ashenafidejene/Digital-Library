import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Event } from '../../services/AdminEventService';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (eventData: Omit<Event, 'id' | 'status' | 'image'> & { image?: File }) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [image, setImage] = useState<File | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({ title, description, date, location, organizer, image });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Event</h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Title
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
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Date
              </label>
              <input
                type="datetime-local"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Organizer
              </label>
              <input
                type="text"
                id="organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="input-field"
                required
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
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
