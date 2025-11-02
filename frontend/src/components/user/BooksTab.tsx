import React, { useState, useEffect, useCallback } from 'react';
import { bookService, Book } from '../../services/bookService';
import { bookingService } from '../../services/bookingService';
import { FaInfoCircle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { userDashboardService } from '../../services/userDashboardService';


interface BooksTabProps {
  favoriteBookIds: string[];
  toggleFavorite: (bookId: string) => void;
}

const BooksTab: React.FC<BooksTabProps> = ({ favoriteBookIds, toggleFavorite }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        page,
        limit: 10,
        search: searchTerm,
        category,
      });
      
      console.log('[BooksTab] Full API Response:', JSON.stringify(response, null, 2));
      
      // Handle response structure: response.data contains the books array
      const booksData = Array.isArray(response.data) ? response.data : [];
      const normalizedBooks = booksData
        .filter((book: any) => book.id || book._id)
        .map((book: any) => ({
          ...book,
          id: book.id || book._id,
        })) as Book[];
      
      console.log('[BooksTab] Books count:', normalizedBooks.length);
      console.log('[BooksTab] Pagination data:', response.pagination);
      console.log('[BooksTab] Total pages:', response.pagination?.totalPages);
      
      setBooks(normalizedBooks);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('[BooksTab] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, category]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, category]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await bookService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleReserveBook = async (bookId: string) => {
    try {
      await bookingService.createBooking(bookId);
      alert('Book reserved successfully!');
      // Optionally, refresh the book list or update the UI
    } catch (err) {
      alert('Failed to reserve book. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input flex-grow"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <div key={book.id || book._id} className="card">
            <div className="relative">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <FaInfoCircle className="text-4xl text-gray-400" />
                </div>
              )}
              <button
                onClick={() => toggleFavorite(book.id)}
                className="absolute top-2 right-2 btn-icon bg-white/70 hover:bg-white"
              >
                {favoriteBookIds.includes(book.id) ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart className="text-gray-600" />
                )}
              </button>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold truncate">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span>{book.category}</span>
                {book.publishedDate && (
                  <>
                    <span className="mx-2">|</span>
                    <span>{new Date(book.publishedDate).getFullYear()}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm h-20 overflow-hidden text-ellipsis flex-grow">{book.description}</p>
              <div className="mt-4">
                {book.status === 'available' ? (
                  <button
                    onClick={() => handleReserveBook(book.id)}
                    className="btn-primary w-full"
                  >
                    Reserve
                  </button>
                ) : (
                  <div className="text-sm font-semibold text-center w-full">
                    {book.dueDate ? (
                      <p className="text-yellow-600">
                        Due in {Math.ceil((new Date(book.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                      </p>
                    ) : (
                      <p className="text-red-500">Not Available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center mt-6">Loading books...</div>}

      {!loading && books.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {page > 1 && (
            <button
              onClick={() => setPage(page - 1)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              {page - 1}
            </button>
          )}
          
          <button className="px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-md">
            {page}
          </button>
          
          {page < totalPages && (
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              {page + 1}
            </button>
          )}
          
          {page + 1 < totalPages && (
            <button
              onClick={() => setPage(page + 2)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              {page + 2}
            </button>
          )}
          
          <button
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksTab;
