import React, { useState, useEffect, useCallback } from 'react';
import { bookService, Book } from '../../services/bookService';
import { bookingService } from '../../services/bookingService';
import { FaInfoCircle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { userDashboardService } from '../../services/userDashboardService';


const BooksTab: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        page,
        limit: 10,
        search: searchTerm,
        category,
      });
      
      setBooks(response.data.data);
      setTotalPages(response.data.pagination.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error(err);
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
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    const fetchFavoriteBooks = async () => {
      try {
        const response = await userDashboardService.getFavoriteBooks();
        setFavoriteBooks(response.data);
      } catch (err) {
        console.error('Failed to fetch favorite books', err);
      }
    };
    fetchCategories();
    fetchFavoriteBooks();
  }, []);

  const handleToggleFavorite = async (bookId: string) => {
    try {
      await userDashboardService.toggleFavorite(bookId);
      setFavoriteBooks(prev => 
        prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
      );
    } catch (err) {
      alert('Failed to update favorite status. Please try again.');
      console.error(err);
    }
  };

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
          <div key={book.id} className="card">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
  <FaInfoCircle className="text-4xl text-gray-400" />
</div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold truncate">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              <p className="mt-2 text-sm h-20 overflow-hidden text-ellipsis">{book.description}</p>
              <div className="flex items-center justify-between mt-4">
                {book.status === 'available' ? (
                  <button
                    onClick={() => handleReserveBook(book.id)}
                    className="btn-primary w-full mr-2"
                  >
                    Reserve
                  </button>
                ) : (
                  <div className="text-sm font-semibold text-center w-full mr-2">
                    {book.dueDate ? (
                      <p className="text-yellow-600">
                        Due in {Math.ceil((new Date(book.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                      </p>
                    ) : (
                      <p className="text-red-500">Not Available</p>
                    )}
                  </div>
                )}
                <button onClick={() => handleToggleFavorite(book.id)} className="btn-icon">
                  {favoriteBooks.includes(book.id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center mt-6">Loading books...</div>}

      {!loading && books.length > 0 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksTab;
