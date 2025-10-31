import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, MegaphoneIcon, BellIcon } from '@heroicons/react/24/outline';
import { UserEventAndAnnouncementService, Event, Announcement } from '../../services/UserEventAndAnnouncementService';

const EventsAndAnnouncementsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsResponse, announcementsResponse] = await Promise.all([
          UserEventAndAnnouncementService.getAllEvents(),
          UserEventAndAnnouncementService.getAllAnnouncements(),
        ]);

        if (eventsResponse.success) {
          setEvents(eventsResponse.data);
        } else {
          setError('Failed to load events. Please try again later.');
        }

        if (announcementsResponse.success) {
          setAnnouncements(announcementsResponse.data);
        } else {
          setError('Failed to load announcements. Please try again later.');
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight text-center mb-12">
            Events & Announcements
          </motion.h1>

          <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`${
                  activeTab === 'announcements'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Announcements
              </button>
            </nav>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div>
              {activeTab === 'events' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-3xl font-bold mb-8 flex items-center">
                    <CalendarIcon className="w-8 h-8 mr-4 text-indigo-500" />
                    Upcoming Events
                  </h2>
                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {events.map((event) => (
                        <motion.div
                          key={event.id}
                          variants={itemVariants}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col group"
                        >
                          <div className="relative">
                            {event.image && <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />}
                            {isUpcoming(event.date) && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                                <BellIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formatDate(event.date)}</p>
                            <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-3 flex-grow">{event.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{event.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No upcoming events.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'announcements' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-3xl font-bold mb-8 flex items-center">
                    <MegaphoneIcon className="w-8 h-8 mr-4 text-teal-500" />
                    Latest Announcements
                  </h2>
                  {announcements.length > 0 ? (
                    <div className="space-y-6">
                      {announcements.map((announcement) => (
                        <motion.div
                          key={announcement.id}
                          variants={itemVariants}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col group"
                        >
                          <div className="relative">
                            {announcement.image && <img src={announcement.image} alt={announcement.title} className="w-full h-48 object-cover" />}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center mb-4">
                              <div className="bg-teal-500 p-2 rounded-full mr-4">
                                <MegaphoneIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-teal-600 dark:text-teal-400">{announcement.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Posted on {formatDate(announcement.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{announcement.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent announcements.</p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventsAndAnnouncementsPage;
