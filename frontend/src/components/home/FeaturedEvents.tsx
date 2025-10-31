import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';

const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAllEvents();
        setEvents(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-16 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Upcoming Events</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Join our community events and programs</p>
          </div>
          <button onClick={() => navigate('/events')} className="btn-outline flex items-center">
            View All <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              className="card-hover cursor-pointer"
              whileHover={{ y: -5 }}
              onClick={() => navigate('/events')}
            >
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg mb-4 overflow-hidden">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CalendarDaysIcon className="w-16 h-16 text-primary-500 opacity-50" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-500 text-white capitalize">
                    {event.status}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                {event.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                {event.description}
              </p>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
