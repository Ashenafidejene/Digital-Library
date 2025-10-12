import React from 'react';
import { motion } from 'framer-motion';
import { ReservedBook } from '../../services/userDashboardService';
import { CalendarDaysIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ReservedBooksTabProps {
  reservedBooks: ReservedBook[];
  cancelReservation: (reservationId: string) => Promise<void>;
}

const ReservedBooksTab: React.FC<ReservedBooksTabProps> = ({ reservedBooks, cancelReservation }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  return (
    <motion.div variants={itemVariants} className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Reserved Books
      </h3>
      {reservedBooks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Book
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Reserved Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Borrowing Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
              {reservedBooks.map((book) => (
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
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">{formatDate(book.reservedDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">{book.borrowPeriodDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        book.status
                      )}`}
                    >
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => cancelReservation(book.id)}
                      className="btn-danger text-sm flex items-center"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No reserved books</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            You haven't reserved any books yet.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ReservedBooksTab;
