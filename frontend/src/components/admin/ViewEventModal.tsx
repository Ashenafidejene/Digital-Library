import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Event } from '../../services/AdminEventService';

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

const ViewEventModal: React.FC<ViewEventModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
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
          <h2 className="text-xl font-bold">{event.title}</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div>
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {event.description}
          </p>
          <div className="flex items-center mb-2">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-neutral-500" />
            <span>{new Date(event.date).toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2 text-neutral-500" />
            <span>{event.location}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p>
              <strong>Organizer:</strong> {event.organizer}
            </p>
            <p>
              <strong>Status:</strong> <span className="capitalize">{event.status}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewEventModal;
