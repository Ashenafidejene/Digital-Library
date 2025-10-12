import React from 'react';
import { motion } from 'framer-motion';
import { ReadingHistory } from '../../services/userDashboardService';
import { ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline';

interface ReadingHistoryTabProps {
  readingHistory: ReadingHistory[];
  rateBook: (historyId: string, rating: number) => Promise<void>;
}

const ReadingHistoryTab: React.FC<ReadingHistoryTabProps> = ({ readingHistory, rateBook }) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number | undefined, historyId: string) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            className={`w-5 h-5 cursor-pointer ${
              rating && index < rating
                ? 'text-yellow-400 fill-current'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
            onClick={() => rateBook(historyId, index + 1)}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={itemVariants} className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Reading History
      </h3>
      {readingHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Book
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Borrowed Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Returned Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Your Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
              {readingHistory.map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {book.title ? book.title.charAt(0) : ''}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{book.title}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">{formatDate(book.borrowedDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">{formatDate(book.returnedDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(book.rating, book.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <ArrowPathIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No reading history</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            You haven't read any books yet.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ReadingHistoryTab;
