import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowPathIcon,
  BookOpenIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getBorrowedBooks,
  approveRequest,
  rejectRequest,
  returnBook,
  getUserBorrowingHistory,
  Borrowing,
} from '../../services/AdminBorrwoingService';

const AdminBorrowingPage: React.FC = () => {
  // State management
  const [borrowingRecords, setBorrowingRecords] = useState<Borrowing[]>([]);
  const [userHistory, setUserHistory] = useState<Borrowing[]>([]);
  const [selectedUser, setSelectedUser] = useState<Borrowing['user'] | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { t } = useLanguage();
  const [token] = useState(localStorage.getItem('token') || '');

  /**
   * Fetch borrowing records from backend with search and filter parameters
   * Includes backend URL validation
   */
  const fetchBorrowingRecords = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching borrowing records from frontend...');
      const response = await getBorrowedBooks(token, searchQuery, selectedStatus);
      console.log('Received borrowing records:', response);
      setBorrowingRecords(response);
    } catch (error) {
      console.error('Failed to fetch borrowing records:', error);
      setBorrowingRecords([]);
      if (error instanceof Error) {
        alert(`Error fetching borrowing records: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, token]);

  /**
   * Approve a borrowing request
   */
  const handleApproveRequest = async (recordId: string) => {
    try {
      await approveRequest(recordId, token);
      fetchBorrowingRecords();
      alert('Borrowing request approved successfully');
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert(`Failed to approve request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Reject a borrowing request
   */
  const handleRejectRequest = async (recordId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await rejectRequest(recordId, reason, token);
      fetchBorrowingRecords();
      alert('Borrowing request rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert(`Failed to reject request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Mark book as returned
   */
  const handleReturnBook = async (recordId: string) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await returnBook(recordId, token);
        fetchBorrowingRecords();
        alert(t('messages.success.bookReturned'));
      } catch (error) {
        console.error('Failed to return book:', error);
        alert(`Failed to return book: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  /**
   * Get status color classes for borrowing status badges
   */
  const getStatusColor = (status: Borrowing['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'approved':
        return 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400';
      case 'borrowed':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400';
      case 'returned':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'overdue':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  /**
   * Get status icon for borrowing status
   */
  const getStatusIcon = (status: Borrowing['status']) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'approved':
        return CheckCircleIcon;
      case 'borrowed':
        return BookOpenIcon;
      case 'returned':
        return CheckCircleIcon;
      case 'overdue':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Check if a record is overdue
   */
  const isOverdue = (record: Borrowing) => {
    if (!record.dueDate || record.status === 'returned') return false;
    return new Date(record.dueDate) < new Date();
  };

  const handleViewHistory = async (userId: string, user: Borrowing['user']) => {
    try {
      console.log('Fetching history for user:', userId);
      const history = await getUserBorrowingHistory(userId, token);
      console.log('Received user history:', history);
      setUserHistory(history);
      setSelectedUser(user);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch user history:', error);
      alert(`Failed to fetch user history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Effects
  useEffect(() => {
    fetchBorrowingRecords();
  }, []);

  // Animation variants
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('admin.borrowing.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage book borrowing and returns
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by user name, book title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="sm:w-48">
            <button
              onClick={() => fetchBorrowingRecords()}
              className="btn btn-primary w-full"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Borrowing Records Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading borrowing records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Fine
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                  {borrowingRecords?.map((record) => {
                    const StatusIcon = getStatusIcon(record.status);
                    const overdue = isOverdue(record);
                    
                    return (
                      <motion.tr
                        key={record.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 ${
                          overdue ? 'bg-error-50 dark:bg-error-900/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {record.user.name}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {record.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {record.book.title}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            by {record.book.author}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className="w-4 h-4 mr-2 text-neutral-400" />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(record.status)}`}>
                              {overdue ? 'Overdue' : record.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          <div>Request: {formatDate(record.requestDate)}</div>
                          {record.dueDate && (
                            <div className={overdue ? 'text-error-600 dark:text-error-400' : ''}>
                              Due: {formatDate(record.dueDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          {record.fineAmount > 0 ? `$${record.fineAmount.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {record.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(record.id)}
                                  className="text-success-600 hover:text-success-700 transition-colors duration-200"
                                  title="Approve Request"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(record.id)}
                                  className="text-error-600 hover:text-error-700 transition-colors duration-200"
                                  title="Reject Request"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {(record.status === 'borrowed' || record.status === 'approved' || overdue) && (
                              <button
                                onClick={() => handleReturnBook(record.id)}
                                className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                                title="Mark as Returned"
                              >
                                <ArrowPathIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleViewHistory(record.userId, record.user)}
                              className="text-info-600 hover:text-info-700 transition-colors duration-200"
                              title="View User History"
                            >
                              <BookOpenIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {(borrowingRecords?.length === 0) && !loading && (
              <div className="text-center py-12">
                <FunnelIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No borrowing records found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {searchQuery || selectedStatus
                    ? 'Try adjusting your search criteria'
                    : 'No borrowing activity yet'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {borrowingRecords?.filter(record => record.status === 'pending').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Pending Requests
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {borrowingRecords?.filter(record => record.status === 'approved').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Currently Borrowed
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-error-600 dark:text-error-400">
            {borrowingRecords?.filter(record => isOverdue(record)).length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Overdue Books
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {borrowingRecords?.filter(record => record.status === 'returned').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Returned Books
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isHistoryModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsHistoryModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                Borrowing History for {selectedUser.name}
              </h2>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">
                        Book
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">
                        Dates
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                    {userHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-2">
                          {record.book.title}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div>Req: {formatDate(record.requestDate)}</div>
                          {record.dueDate && (
                            <div>Due: {formatDate(record.dueDate)}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBorrowingPage;
