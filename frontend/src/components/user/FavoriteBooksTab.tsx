import React from 'react';
import { Book } from '../../services/bookService';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface FavoriteBooksTabProps {
  favoriteBooks: Book[];
  toggleFavorite: (bookId: string) => void;
}

const FavoriteBooksTab: React.FC<FavoriteBooksTabProps> = ({
  favoriteBooks,
  toggleFavorite,
}) => {

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Favorite Books
      </h3>
      {favoriteBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteBooks.map((book) => (
            <div key={book.id} className="card relative group">
              <button
                onClick={() => toggleFavorite(book.id)}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                {favoriteBooks.some((favBook) => favBook.id === book.id) ? (
                  <FaHeart className="w-6 h-6" />
                ) : (
                  <FaRegHeart className="w-6 h-6" />
                )}
              </button>
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <FaHeart className="text-4xl text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold truncate">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaHeart className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No favorite books</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            You haven't added any books to your favorites yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoriteBooksTab;
