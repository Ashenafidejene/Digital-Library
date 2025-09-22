import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../../contexts/LanguageContext';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  coverImage: string;
  isAvailable: boolean;
  isFavorite: boolean;
}

interface FeaturedBooksProps {
  books?: Book[];
}

const FeaturedBooks: React.FC<FeaturedBooksProps> = ({ books = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  // Mock data if no books provided
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      category: 'Fiction',
      rating: 4.5,
      coverImage: '/api/placeholder/200/300',
      isAvailable: true,
      isFavorite: false,
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'Fiction',
      rating: 4.8,
      coverImage: '/api/placeholder/200/300',
      isAvailable: true,
      isFavorite: false,
    },
    {
      id: '3',
      title: '1984',
      author: 'George Orwell',
      category: 'Dystopian Fiction',
      rating: 4.7,
      coverImage: '/api/placeholder/200/300',
      isAvailable: false,
      isFavorite: false,
    },
    {
      id: '4',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      category: 'Romance',
      rating: 4.6,
      coverImage: '/api/placeholder/200/300',
      isAvailable: true,
      isFavorite: false,
    },
    {
      id: '5',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      category: 'Fiction',
      rating: 4.3,
      coverImage: '/api/placeholder/200/300',
      isAvailable: true,
      isFavorite: false,
    },
    {
      id: '6',
      title: 'Lord of the Flies',
      author: 'William Golding',
      category: 'Fiction',
      rating: 4.4,
      coverImage: '/api/placeholder/200/300',
      isAvailable: true,
      isFavorite: false,
    },
  ];

  const displayBooks = books.length > 0 ? books : mockBooks;
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
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
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary-500 text-white">
                {t('home.featured.popular')}
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors duration-200">
                {t('home.featured.newArrivals')}
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors duration-200">
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
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                                <div className="text-center p-4">
                                  <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <span className="text-white font-bold text-xl">
                                      {book.title.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Book Cover
                                  </div>
                                </div>
                              </div>

                              {/* Availability Badge */}
                              <div className="absolute top-2 left-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    book.isAvailable
                                      ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                                      : 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                                  }`}
                                >
                                  {book.isAvailable ? 'Available' : 'Borrowed'}
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
                                    {book.rating}
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
