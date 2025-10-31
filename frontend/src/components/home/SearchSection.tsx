import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchSectionProps {
  onSearch?: (query: string, category: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useLanguage();

  const categories = [
    { id: 'all', name: t('home.search.categories.all') },
    { id: 'fiction', name: t('home.search.categories.fiction') },
    { id: 'nonfiction', name: t('home.search.categories.nonfiction') },
    { id: 'science', name: t('home.search.categories.science') },
    { id: 'history', name: t('home.search.categories.history') },
    { id: 'biography', name: t('home.search.categories.biography') },
    { id: 'children', name: t('home.search.categories.children') },
    { id: 'academic', name: t('home.search.categories.academic') },
    { id: 'reference', name: t('home.search.categories.reference') },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, selectedCategory);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
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
    <section className="py-16 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            {t('home.search.title')}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-neutral-600 dark:text-neutral-300 mb-12 max-w-2xl mx-auto"
          >
            Explore our extensive collection of books across various categories and find your next favorite read.
          </motion.p>

          {/* Search Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col lg:flex-row gap-4 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-2xl shadow-soft">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-700 border-0 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  placeholder={t('home.search.placeholder')}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white dark:bg-neutral-700 border-0 rounded-xl px-4 py-4 pr-10 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 cursor-pointer min-w-[200px]"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-neutral-400" />
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="btn-primary px-8 py-4 text-lg font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              >
                {t('common.search')}
              </button>
            </div>
          </motion.form>

          {/* Category Pills */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {categories.slice(1, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                15,420
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {t('home.stats.totalBooks')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                156
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {t('home.stats.newThisMonth')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                50+
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {t('home.stats.categories')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                24/7
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {t('home.stats.digitalAccess')}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;
