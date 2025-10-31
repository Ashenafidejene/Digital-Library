import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BorrowedBook } from '../../services/userDashboardService';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface BorrowedBooksTabProps {
  borrowedBooks: BorrowedBook[];
  renewBook: (bookingId: string) => void;
}

const BorrowedBooksTab: React.FC<BorrowedBooksTabProps> = ({ borrowedBooks, renewBook }) => {

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

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'overdue':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'renewed':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };


  return (
    <motion.div variants={itemVariants} className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Borrowed Books
      </h3>
      {borrowedBooks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Book
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Due Date
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
              {borrowedBooks.map((book) => {
                const daysUntilDue = book.dueDate ? getDaysUntilDue(book.dueDate) : 0;
                return (
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
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">{book.dueDate ? formatDate(book.dueDate) : ''}</div>
                      <div className={`text-sm ${daysUntilDue < 0 ? 'text-error-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(book.status)}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => renewBook(book.id)}
                        className="btn-secondary text-sm flex items-center"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Renew
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No borrowed books</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            You haven't borrowed any books yet.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BorrowedBooksTab;
