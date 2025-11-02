import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { announcementService, Announcement } from '../services/announcementService';

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await announcementService.getAllAnnouncements();
        console.log('Announcements page response:', response);
        const published = Array.isArray(response.data)
          ? response.data.filter(a => a.status === 'published')
          : [];
        console.log('Published announcements count:', published.length);
        setAnnouncements(published);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'high': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'medium': return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1 sm:mb-2">
            Library Announcements
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Stay updated with the latest library news and updates
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                variants={itemVariants}
                className="card-hover group cursor-pointer flex flex-col h-full"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {announcement.image && (
                  <div className="relative h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden">
                    <img src={announcement.image} alt={announcement.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full capitalize ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                  <MegaphoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2 break-words min-h-[3rem]">
                  {announcement.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-4 leading-relaxed break-words flex-grow">
                  {announcement.content}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
                  <span className="break-words">{new Date(announcement.publishDate).toLocaleDateString()}</span>
                  <span className="text-neutral-600 dark:text-neutral-400 truncate">by {announcement.authorName}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="text-center py-12">
            <MegaphoneIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No announcements found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              No announcements are currently published.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
