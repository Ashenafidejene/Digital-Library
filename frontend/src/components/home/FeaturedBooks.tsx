import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFeaturedBooks, Book } from '../../services/bookService';

const FeaturedBooks: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState('popular');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getFeaturedBooks({ limit: 12 });
        if (activeTab === 'popular') {
          setBooks(data.popularBooks);
        } else if (activeTab === 'newArrivals') {
          setBooks(data.recentlyAddedBooks);
        } else {
          setBooks(data.recommendedBooks);
        }
      } catch (error) {
        console.error('Error fetching featured books:', error);
      }
    };

    fetchBooks();
  }, [activeTab]);

  const displayBooks = books;
  const booksPerSlide = 4;
  const totalSlides = Math.ceil(displayBooks.length / booksPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(bookId)) {
        newFavorites.delete(bookId);
      } else {
        newFavorites.add(bookId);
      }
      return newFavorites;
    });
  };

  const renderStars = (rating?: { average: number; count: number }) => {
    const avgRating = rating?.average || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(avgRating)
            ? 'text-yellow-400 fill-current'
            : 'text-neutral-300 dark:text-neutral-600'
        }`}
      />
    ));
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
    <section className="py-16 bg-neutral-50 dark:bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {t('home.featured.title')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Discover our handpicked selection of popular and recommended books across various genres.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-white dark:bg-neutral-700 rounded-lg p-1 shadow-soft">
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'popular'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                } transition-colors duration-200`}
              >
                {t('home.featured.popular')}
              </button>
              <button
                onClick={() => setActiveTab('newArrivals')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'newArrivals'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                } transition-colors duration-200`}
              >
                {t('home.featured.newArrivals')}
              </button>
              <button
                onClick={() => setActiveTab('recommended')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'recommended'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                } transition-colors duration-200`}
              >
                {t('home.featured.recommended')}
              </button>
            </div>
          </motion.div>

          {/* Books Carousel */}
          <motion.div variants={itemVariants} className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200 -ml-6"
              disabled={currentSlide === 0}
            >
              <ChevronLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200 -mr-6"
              disabled={currentSlide === totalSlides - 1}
            >
              <ChevronRightIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
            </button>

            {/* Books Grid */}
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {Array.from({ length: totalSlides }, (_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {displayBooks
                      .slice(slideIndex * booksPerSlide, (slideIndex + 1) * booksPerSlide)
                      .map((book) => (
                        <motion.div
                          key={book.id}
                          className="group cursor-pointer"
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="card-hover relative overflow-hidden">
                            {/* Book Cover */}
                            <div className="relative aspect-[3/4] bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden mb-4">
                              {book.coverImage ? (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                                  <span className="text-4xl">📚</span>
                                </div>
                              )}

                              {/* Availability Badge */}
                              <div className="absolute top-2 left-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    book.availability.availableCopies > 0
                                      ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                                      : 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                                  }`}
                                >
                                  {book.availability.availableCopies > 0 ? 'Available' : 'Borrowed'}
                                </span>
                              </div>

                              {/* Favorite Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(book.id);
                                }}
                                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors duration-200"
                              >
                                {favorites.has(book.id) ? (
                                  <HeartSolidIcon className="w-4 h-4 text-primary-500" />
                                ) : (
                                  <HeartIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                )}
                              </button>
                            </div>

                            {/* Book Info */}
                            <div>
                              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                                {book.title}
                              </h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                {book.author}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  {renderStars(book.rating)}
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
                                    {book.rating?.average?.toFixed(1) || 'N/A'}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-full">
                                  {book.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentSlide
                      ? 'bg-primary-500'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
