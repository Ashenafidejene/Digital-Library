import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MegaphoneIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { announcementService, Announcement } from '../../services/announcementService';

const FeaturedAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementService.getAllAnnouncements();
        console.log('Announcements response:', response);
        const published = Array.isArray(response.data) 
          ? response.data.filter(a => a.status === 'published').slice(0, 3)
          : [];
        console.log('Published announcements:', published);
        setAnnouncements(published);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) {
    console.log('No announcements to display');
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'high': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'medium': return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Latest Announcements</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Stay updated with library news</p>
          </div>
          <button onClick={() => navigate('/announcements')} className="btn-outline flex items-center">
            View All <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              className="card-hover cursor-pointer"
              whileHover={{ y: -5 }}
              onClick={() => navigate('/announcements')}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </span>
                <MegaphoneIcon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                {announcement.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-3">
                {announcement.content}
              </p>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>{new Date(announcement.publishDate).toLocaleDateString()}</span>
                <span className="text-primary-600 dark:text-primary-400 font-medium">Read more →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAnnouncements;
