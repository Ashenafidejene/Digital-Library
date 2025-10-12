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
import { AdminEventService, Event } from '../../services/AdminEventService';
import AddEventModal from '../../components/admin/AddEventModal';

const AdminEventsPage: React.FC = () => {
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { t } = useLanguage();

  /**
   * Fetch events from backend with search and filter parameters
   * Includes backend URL validation
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminEventService.getAllEvents();
      if (response.success) {
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

  const handleAddEvent = async (eventData: Omit<Event, 'id' | 'status'>) => {
    try {
      const response = await AdminEventService.createEvent(eventData);
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

      {/* Events Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                  {events?.map((event) => (
                    <motion.tr
                      key={event.id}
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
                              <CalendarDaysIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {event.title}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                              {truncateDescription(event.description)}
                            </div>
                            <div className="flex items-center text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2 text-neutral-400" />
                          <div>{formatDateTime(event.date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {event.organizer}
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
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

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
          </div>
        )}
      </div>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

export default AdminEventsPage;
