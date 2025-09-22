import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { BorrowedBook } from '../../services/dashboardService';

interface BorrowedBooksTabProps {
  borrowedBooks: BorrowedBook[];
  loading: boolean;
  actionLoading: string | null;
  onSendReminder: (bookId: string) => void;
  onRenewBook: (bookId: string) => void;
  onReturnBook: (bookId: string) => void;
}

const BorrowedBooksTab: React.FC<BorrowedBooksTabProps> = ({
  borrowedBooks,
  loading,
  actionLoading,
  onSendReminder,
  onRenewBook,
  onReturnBook
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner w-8 h-8 mr-4"></div>
        <span className="text-neutral-600 dark:text-neutral-400">Loading borrowed books...</span>
      </div>
    );
  }

  if (borrowedBooks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircleIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          No Borrowed Books
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          All books have been returned or no books are currently borrowed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Borrowed Books Management
        </h2>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {borrowedBooks.length} book{borrowedBooks.length !== 1 ? 's' : ''} currently borrowed
        </div>
      </div>

      <div className="grid gap-6">
        {borrowedBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {book.title}
                  </h3>
                  <div className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${book.status === 'overdue'
                      ? 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                      : 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                    }
                  `}>
                    {book.status === 'overdue' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                    {book.status}
                  </div>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                  by {book.author} • ISBN: {book.isbn}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  <div>
                    <span className="font-medium">Borrower:</span> {book.borrowerName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {book.borrowerEmail}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {book.borrowerPhone}
                  </div>
                  <div>
                    <span className="font-medium">Borrowed:</span> {new Date(book.borrowDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span> {new Date(book.dueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Renewals:</span> {book.renewalCount}/{book.maxRenewals}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => onSendReminder(book.id)}
                  disabled={actionLoading === `reminder-${book.id}`}
                  className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
                >
                  {actionLoading === `reminder-${book.id}` ? (
                    <div className="spinner w-3 h-3" />
                  ) : (
                    <span>Send Reminder</span>
                  )}
                </button>
                {book.renewalCount < book.maxRenewals && (
                  <button
                    onClick={() => onRenewBook(book.id)}
                    disabled={actionLoading === `renew-${book.id}`}
                    className="btn-primary text-xs px-3 py-1 flex items-center space-x-1"
                  >
                    {actionLoading === `renew-${book.id}` ? (
                      <div className="spinner w-3 h-3" />
                    ) : (
                      <span>Renew</span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => onReturnBook(book.id)}
                  disabled={actionLoading === `return-${book.id}`}
                  className="btn-success text-xs px-3 py-1 flex items-center space-x-1"
                >
                  {actionLoading === `return-${book.id}` ? (
                    <div className="spinner w-3 h-3" />
                  ) : (
                    <span>Mark Returned</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BorrowedBooksTab;
