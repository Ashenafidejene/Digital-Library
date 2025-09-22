import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  maxAttendees?: number;
  currentAttendees: number;
  image?: string;
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { t } = useLanguage();

  // Mock events data
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Reading Club: Classic Literature',
      description: 'Join us for a discussion on classic literature. This month we\'re reading "Pride and Prejudice" by Jane Austen.',
      date: '2024-02-15',
      time: '18:00',
      location: 'Main Reading Hall',
      category: 'Reading Club',
      maxAttendees: 25,
      currentAttendees: 18,
      organizer: 'Library Staff',
      status: 'upcoming',
      tags: ['literature', 'discussion', 'classics'],
    },
    {
      id: '2',
      title: 'Children\'s Story Time',
      description: 'Interactive storytelling session for children aged 4-8. Come and enjoy magical stories with your little ones.',
      date: '2024-02-18',
      time: '10:00',
      location: 'Children\'s Section',
      category: 'Children',
      maxAttendees: 20,
      currentAttendees: 12,
      organizer: 'Ms. Sarah Johnson',
      status: 'upcoming',
      tags: ['children', 'storytelling', 'interactive'],
    },
    {
      id: '3',
      title: 'Digital Literacy Workshop',
      description: 'Learn essential digital skills including internet safety, online research, and basic computer operations.',
      date: '2024-02-20',
      time: '14:00',
      location: 'Computer Lab',
      category: 'Workshop',
      maxAttendees: 15,
      currentAttendees: 8,
      organizer: 'Tech Team',
      status: 'upcoming',
      tags: ['technology', 'education', 'skills'],
    },
    {
      id: '4',
      title: 'Author Meet & Greet',
      description: 'Meet renowned Ethiopian author Dr. Alemseged Tesfai and get your books signed.',
      date: '2024-02-25',
      time: '16:00',
      location: 'Main Hall',
      category: 'Author Event',
      maxAttendees: 50,
      currentAttendees: 35,
      organizer: 'Library Management',
      status: 'upcoming',
      tags: ['author', 'signing', 'meet-greet'],
    },
    {
      id: '5',
      title: 'Research Skills Seminar',
      description: 'Advanced research techniques for students and academics. Learn how to effectively use library resources.',
      date: '2024-02-28',
      time: '13:00',
      location: 'Conference Room',
      category: 'Seminar',
      maxAttendees: 30,
      currentAttendees: 22,
      organizer: 'Research Department',
      status: 'upcoming',
      tags: ['research', 'academic', 'skills'],
    },
  ];

  const categories = ['all', 'Reading Club', 'Children', 'Workshop', 'Author Event', 'Seminar'];

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.category === selectedCategory
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400';
      case 'ongoing':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'completed':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
      case 'cancelled':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

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
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Library Events
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Join our community events, workshops, and programs
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {category === 'all' ? 'All Events' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="card-hover group cursor-pointer"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Event Image/Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg mb-4 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CalendarDaysIcon className="w-16 h-16 text-primary-500 opacity-50" />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <CalendarDaysIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    
                    {event.maxAttendees && (
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <UsersIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.currentAttendees}/{event.maxAttendees} attendees</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      by {event.organizer}
                    </span>
                    <button className="btn-primary text-sm px-4 py-2">
                      {event.status === 'upcoming' ? 'Register' : 'View Details'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No events found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {selectedCategory === 'all' 
                ? 'No events are currently scheduled.' 
                : `No events found in the ${selectedCategory} category.`
              }
            </p>
          </div>
        )}

        {/* Call to Action */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-12 text-center">
            <div className="card max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Want to organize an event?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We welcome community members to propose and organize events at our library.
              </p>
              <button className="btn-primary">
                Propose an Event
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;
