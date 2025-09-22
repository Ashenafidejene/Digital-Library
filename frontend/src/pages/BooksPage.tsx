import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { bookService, Book, BookQuery } from '../services/bookService';

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<BookQuery>({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const { t } = useLanguage();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks(filters);

      console.log('📚 Public Books API Response:', response);

      // Handle paginated response structure
      // The backend returns: { success: true, data: { data: [books], pagination: {...} } }
      // But TypeScript expects: { success: true, data: [books] }
      let booksData: Book[] = [];
      let paginationData = null;

      // Check if response has the paginated structure
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Paginated response: response.data.data contains the books array
        const paginatedData = response.data as any;
        if (Array.isArray(paginatedData.data)) {
          booksData = paginatedData.data;
          paginationData = paginatedData.pagination;
        }
      } else if (Array.isArray(response.data)) {
        // Direct response: response.data is the books array
        booksData = response.data;
        paginationData = (response as any).pagination;
      }

      console.log('📚 Extracted books data:', booksData);
      setBooks(booksData);
      setTotalPages(paginationData?.totalPages || 1);
      setCurrentPage(paginationData?.currentPage || paginationData?.page || 1);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await bookService.getCategories();
      console.log('📂 Categories API Response:', response);

      // Categories endpoint returns data directly (not paginated)
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof BookQuery, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const renderStars = (rating: number = 0) => {
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
      <Header onSearch={handleSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Book Catalog
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Explore our extensive collection of books across various categories
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search books, authors, ISBN..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy || 'title'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
              <option value="publicationDate">Sort by Date</option>
              <option value="rating">Sort by Rating</option>
            </select>

            {/* Sort Order */}
            <select
              value={filters.sortOrder || 'asc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="input-field min-w-[120px]"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            {/* Available Only */}
            <label className="flex items-center space-x-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={filters.available || false}
                onChange={(e) => handleFilterChange('available', e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
              />
              <span>Available only</span>
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-error-500 mb-4">
              <FunnelIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Error Loading Books
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
            <button
              onClick={fetchBooks}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Books Grid/List */}
        {!loading && !error && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {books?.map((book) => (
                <motion.div
                  key={book.id}
                  variants={itemVariants}
                  className={`group cursor-pointer ${
                    viewMode === 'grid' ? 'card-hover' : 'card-hover flex items-center space-x-4 p-4'
                  }`}
                  whileHover={{ y: viewMode === 'grid' ? -5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Book Cover */}
                  <div className={`relative bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden ${
                    viewMode === 'grid' ? 'aspect-[3/4] mb-4' : 'w-20 h-28 flex-shrink-0'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                      <div className="text-center p-2">
                        <div className={`bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                          viewMode === 'grid' ? 'w-16 h-16' : 'w-8 h-8'
                        }`}>
                          <span className={`text-white font-bold ${
                            viewMode === 'grid' ? 'text-xl' : 'text-sm'
                          }`}>
                            {book.title.charAt(0)}
                          </span>
                        </div>
                        {viewMode === 'grid' && (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            Book Cover
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          book.status === 'available'
                            ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                            : 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                        }`}
                      >
                        {book.status === 'available' ? 'Available' : 'Borrowed'}
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
                  <div className={viewMode === 'grid' ? '' : 'flex-1 min-w-0'}>
                    <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 ${
                      viewMode === 'grid' ? 'mb-1 line-clamp-2' : 'mb-1 truncate'
                    }`}>
                      {book.title}
                    </h3>
                    <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${
                      viewMode === 'grid' ? 'mb-2' : 'mb-1 truncate'
                    }`}>
                      by {book.author}
                    </p>
                    
                    {viewMode === 'list' && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    <div className={`flex items-center ${
                      viewMode === 'grid' ? 'justify-between' : 'space-x-4'
                    }`}>
                      <div className="flex items-center space-x-1">
                        {renderStars(book.rating)}
                        {book.rating && (
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
                            {book.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-full">
                        {book.category}
                      </span>
                    </div>

                    {viewMode === 'list' && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span>Available: {book.availability.availableCopies}/{book.availability.totalCopies}</span>
                        </div>
                        <button className="btn-primary text-sm px-4 py-2">
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {books.length === 0 && (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No books found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  const page = index + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        page === currentPage
                          ? 'bg-primary-500 text-white'
                          : 'border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BooksPage;
