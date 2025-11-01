import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, BookOpenIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { getHomePageStats, HomePageStats } from '../../services/homeService';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<HomePageStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getHomePageStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching home page stats:', error);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                <span className="block">{t('home.hero.title').split(' ').slice(0, 3).join(' ')}</span>
                <span className="block text-gradient">
                  {t('home.hero.title').split(' ').slice(3).join(' ')}
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <button
                className="btn-primary text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-2.5 sm:py-3 group w-full sm:w-auto"
                onClick={() => {
                  const searchSection = document.getElementById('search-section');
                  if (searchSection) {
                    searchSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {t('home.hero.cta')}
                <ArrowRightIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                className="btn-outline text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
                onClick={() => navigate('/login')}
              >
                {t('home.hero.membershipCta')}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-center lg:text-left"
            >
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {stats ? `${(stats.totalBooks / 1000).toFixed(1)}K+` : '...'}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 sm:mt-1">
                  {t('home.stats.booksAvailable')}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {stats ? `${(stats.totalMembers / 1000).toFixed(1)}K+` : '...'}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 sm:mt-1">
                  {t('home.stats.activeMembers')}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {stats ? `${stats.totalCategories}+` : '...'}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 sm:mt-1">
                  {t('home.stats.categories')}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative mt-8 lg:mt-0">
            <motion.div
              variants={itemVariants}
              className="relative z-10"
            >
              {/* Main Illustration Container */}
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full transform rotate-6"></div>
                
                {/* Floating Elements */}
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-neutral-800 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center"
                >
                  <BookOpenIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-500" />
                </motion.div>

                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: '1s' }}
                  className="absolute bottom-4 sm:bottom-8 left-2 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white dark:bg-neutral-800 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center"
                >
                  <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-success-500" />
                </motion.div>

                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: '2s' }}
                  className="absolute top-1/2 left-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-neutral-800 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center"
                >
                  <GlobeAltIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-warning-500" />
                </motion.div>

                {/* Central Image Placeholder */}
                <div className="relative bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mx-4 sm:mx-6 md:mx-8">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BookOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="h-2 sm:h-2.5 md:h-3 bg-primary-200 dark:bg-primary-700 rounded w-3/4 mx-auto"></div>
                        <div className="h-2 sm:h-2.5 md:h-3 bg-primary-200 dark:bg-primary-700 rounded w-1/2 mx-auto"></div>
                        <div className="h-2 sm:h-2.5 md:h-3 bg-primary-200 dark:bg-primary-700 rounded w-2/3 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 rounded-full opacity-20"></div>
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-success-500 rounded-full opacity-30"></div>
                <div className="absolute top-1/4 -right-3 sm:-right-6 w-3 h-3 sm:w-4 sm:h-4 bg-warning-500 rounded-full opacity-25"></div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white dark:text-neutral-900"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
