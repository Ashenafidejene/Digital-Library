import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { apiRequest } from '../../services/api';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const EventsAndAnnouncementsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ events: Event[]; announcements: Announcement[] }>('/events-and-announcements');
        if (response.data) {
          console.log('Events and Announcements Data:', response.data);
          setEvents(response.data.events || []);
          setAnnouncements(response.data.announcements || []);
        }
        else {
          setError('Failed to load data. Please try again later.');
        }
        
        setError(null);
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

          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Events Section */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-3 text-indigo-500" />
                  Upcoming Events
                </h2>
                <div className="space-y-6">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      variants={itemVariants}
                      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{event.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formatDate(event.date)}</p>
                      <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
                    </motion.div>
                  ))}
                  {events.length === 0 && <p>No upcoming events.</p>}
                </div>
              </motion.div>

              {/* Announcements Section */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <MegaphoneIcon className="w-6 h-6 mr-3 text-teal-500" />
                  Latest Announcements
                </h2>
                <div className="space-y-6">
                  {announcements.map((announcement) => (
                    <motion.div
                      key={announcement.id}
                      variants={itemVariants}
                      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-bold text-lg text-teal-600 dark:text-teal-400">{announcement.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Posted on {formatDate(announcement.createdAt)}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">{announcement.content}</p>
                    </motion.div>
                  ))}
                  {announcements.length === 0 && <p>No recent announcements.</p>}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventsAndAnnouncementsPage;
