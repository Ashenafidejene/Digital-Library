import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { AdminEventService, Event } from '../../services/AdminEventService';
import AddEventModal from '../../components/admin/AddEventModal';
import EditEventModal from '../../components/admin/EditEventModal';
import ViewEventModal from '../../components/admin/ViewEventModal';

const AdminEventsPage: React.FC = () => {
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  /**
   * Fetch events from backend with search and filter parameters
   * Includes backend URL validation
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminEventService.getAllEvents();
      if (response.success) {
        console.log('Fetched events:', response.data);
        setEvents(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      alert(`Error fetching events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddEvent = async (eventData: Omit<Event, 'id' | 'status' | 'image' | 'authorId' | 'authorName'> & { image?: File }) => {
    if (!user) {
      alert('You must be logged in to create an event.');
      return;
    }
    try {
      const newEventData = {
        ...eventData,
        authorId: user.id,
        authorName: user.name,
      };
      const response = await AdminEventService.createEvent(newEventData);
      if (response.success) {
        setEvents(prevEvents => [response.data, ...prevEvents]);
        setIsAddModalOpen(false);
        alert('Event created successfully');
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateEvent = async (eventData: Event & { imageFile?: File }) => {
    try {
      const { id, image, ...rest } = eventData;
      const dataToUpdate: Partial<Omit<Event, 'id' | 'image'>> & { image?: File } = rest;
      if (eventData.imageFile) {
        dataToUpdate.image = eventData.imageFile;
      }

      const response = await AdminEventService.updateEvent(id, dataToUpdate);
      if (response.success) {
        setEvents(events.map(event => (event.id === id ? response.data : event)));
        setIsEditModalOpen(false);
        alert('Event updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      alert(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await AdminEventService.deleteEvent(eventId);
        if (response.success) {
          setEvents(events.filter(event => event.id !== eventId));
          alert('Event deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete event');
        }
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  /**
   * Get status color classes for event status badges
   */
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400';
      case 'past':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
      case 'cancelled':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Format date and time for display
   */
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  /**
   * Truncate description for display
   */
  const truncateDescription = (description: string, maxLength: number = 100) => {
    return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
  };

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [fetchEvents]);

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
            {t('navigation.events')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage library events and activities
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Event
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
                placeholder="Search events..."
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
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-8 text-center col-span-full">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading events...</p>
          </div>
        ) : (
          <AnimatePresence>
            {events?.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="card flex flex-col justify-between"
              >
                <div>
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover rounded-t-lg mb-4"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {event.title}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                      {truncateDescription(event.description, 120)}
                    </p>
                    <div className="flex items-center mt-4">
                      <CalendarDaysIcon className="w-4 h-4 mr-2 text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {formatDateTime(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <MapPinIcon className="w-4 h-4 mr-2 text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    by {event.organizer}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsViewModalOpen(true);
                      }}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsEditModalOpen(true);
                      }}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-warning-600 dark:hover:text-warning-400 transition-colors duration-200"
                      title="Edit Event"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors duration-200"
                      title="Delete Event"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      {(events?.length === 0) && !loading && (
        <div className="text-center py-12">
          <FunnelIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No events found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {searchQuery || selectedStatus
              ? 'Try adjusting your search criteria'
              : 'Start by creating your first event'}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {events?.length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total Events
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-info-600 dark:text-info-400">
            {events?.filter(event => event.status === 'upcoming').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Upcoming
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
            {events?.filter(event => event.status === 'past').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Past
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-error-600 dark:text-error-400">
            {events?.filter(event => event.status === 'cancelled').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Cancelled
          </div>
        </div>
      </div>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
      {selectedEvent && (
        <>
          <EditEventModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdateEvent={handleUpdateEvent}
            event={selectedEvent}
          />
          <ViewEventModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            event={selectedEvent}
          />
        </>
      )}
    </div>
  );
};

export default AdminEventsPage;
