import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  BookOpenIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { userService,User,RawBorrowingRecord,BorrowingApiResponse,BookingRequest,BorrowedBook } from '../../services/adminUserService';

const AdminUsersPage: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClearance, setSelectedClearance] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [borrowingStats, setBorrowingStats] = useState({
    totalActiveUsers: 0,
    totalBorrowedBooks: 0,
    totalOverdueBooks: 0,
    totalPendingRequests: 0,
  });
  const { t } = useLanguage();

  /**
   * Calculate days left for a due date
   */
  const calculateDaysLeft = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Fetch users with enhanced borrowing and booking data
   */
  const fetchUsers = useCallback(async () => {
  try {
    setLoading(true);

    // Build query parameters for the userService
    const query: Record<string, string> = {};
    if (searchQuery) query.search = searchQuery;
    if (selectedRole) query.role = selectedRole;
    if (selectedStatus) query.status = selectedStatus;
    if (selectedClearance) query.clearance = selectedClearance;
    query.limit = '10';
    query.includeBorrowing = 'true';

    // ✅ 1. Fetch users through the service
    const usersResponse = await userService.getUsers(query);
    if (!usersResponse.success) {
      throw new Error(usersResponse.message || 'Failed to fetch users');
    }
    console.log("this data user ",usersResponse);
    const usersData = usersResponse.data.data || [];

    // ✅ 2. Fetch borrowing records through the service (optional but recommended)
    let borrowingRecords: RawBorrowingRecord[] = [];
    try {
      const borrowingResponse = await userService.getBorrowingRecords();
      if (borrowingResponse.success) {
        borrowingRecords = borrowingResponse.data.records || [];
      }
    } catch (err) {
      console.warn('Could not fetch borrowing records:', err);
    }

    // ✅ 3. Enhance users with borrowing info
    const enhancedUsers = usersData.map((user: User) => {
      const userBorrowings = borrowingRecords.filter(
        (record) => record.userId === user.id
      );

      const currentBorrowings: BorrowedBook[] = userBorrowings
        .filter(
          (record) => record.status === 'borrowed' || record.status === 'active'
        )
        .map((record) => ({
          id: record.id,
          bookId: record.bookId,
          bookTitle: record.bookTitle,
          bookAuthor: record.bookAuthor,
          borrowDate: record.borrowDate || '',
          dueDate: record.dueDate || '',
          daysLeft: record.dueDate ? calculateDaysLeft(record.dueDate) : 0,
          status:
            record.dueDate && calculateDaysLeft(record.dueDate) < 0
              ? 'overdue'
              : 'active',
          renewalCount: record.renewalCount || 0,
          maxRenewals: record.maxRenewals || 2,
        }));

      const pendingRequests: BookingRequest[] = userBorrowings
        .filter((record) => record.status === 'pending')
        .map((record) => ({
          id: record.id,
          bookId: record.bookId,
          bookTitle: record.bookTitle,
          bookAuthor: record.bookAuthor,
          requestDate: record.requestDate,
          status: record.status as 'pending' | 'approved' | 'rejected',
          priority: record.priority || 1,
        }));

      const overdueBooks = currentBorrowings.filter(
        (b) => b.status === 'overdue'
      ).length;

      // Fix: Explicitly type clearanceStatus as the union type expected by User
      const clearanceStatus: "blocked" | "pending" | "clear" =
        overdueBooks > 0
          ? "blocked"
          : pendingRequests.length > 0
          ? "pending"
          : "clear";

      return {
        ...user,
        borrowedBooks: currentBorrowings.length,
        overdueBooks,
        pendingBookings: pendingRequests.length,
        clearanceStatus, // now correctly typed
        currentBorrowings,
        pendingRequests,
      };
    });

    // ✅ 4. Update state
    console.log('Enhanced Users:', enhancedUsers);
    setUsers(enhancedUsers);

    // ✅ 5. Compute stats
    const stats = {
      totalActiveUsers: enhancedUsers.filter((u: User) => u.status === 'active').length,
      totalBorrowedBooks: enhancedUsers.reduce(
        (sum: number, u: User) => sum + u.borrowedBooks,
        0
      ),
      totalOverdueBooks: enhancedUsers.reduce(
        (sum: number, u: User) => sum + (u.overdueBooks || 0),
        0
      ),
      totalPendingRequests: enhancedUsers.reduce(
        (sum: number, u: User) => sum + (u.pendingBookings || 0),
        0
      ),
    };
    setBorrowingStats(stats);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    setUsers([]);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        alert(
          'Cannot connect to backend server. Please ensure the server is running.'
        );
      } else {
        alert(`Error fetching users: ${error.message}`);
      }
    }
  } finally {
    setLoading(false);
  }
}, [searchQuery, selectedRole, selectedStatus, selectedClearance]);

  /**
   * Add new admin to the system
   */
  const handleAddAdmin = async (adminData: { name: string; email: string; phone?: string }) => {
    try {
      const response = await userService.addAdmin(adminData);
      if (response.success) {
        setUsers((prev) => [response.data, ...prev]);
        setIsAddModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to create admin:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);;

  /**
   * Delete user from the system
   */
  // Delete user
  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (error) {
        console.error("Failed to delete user", error);
        alert('Failed to delete user.');
      }
    }
  };

  /**
   * View user details with borrowing history
   */
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    try {
      // TODO: Implement updateUser in userService
      // const response = await userService.updateUser(selectedUser.id, userData);
      // if (response.success) {
      //   fetchUsers(); // Refetch all users to get updated data
      //   setIsEditModalOpen(false);
      //   setSelectedUser(null);
      // } else {
      //   throw new Error(response.message || 'Failed to update user');
      // }
      alert('Update user functionality is not implemented yet.');
    } catch (error) {
      console.error("Failed to update user:", error);
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Check user clearance status
   */
  const handleClearanceCheck = (user: User) => {
    setSelectedUser(user);
    setIsClearanceModalOpen(true);
  };

  const handleGenerateCertificate = (user: User) => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Library Clearance Certificate', 105, 20, { align: 'center' });

    // Add library info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Library System', 105, 30, { align: 'center' });
    doc.text(new Date().toLocaleDateString(), 105, 35, { align: 'center' });

    // Add content
    doc.setFontSize(14);
    doc.text('This is to certify that:', 20, 60);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, 105, 80, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const clearanceText = `with email ${user.email}, has returned all borrowed materials and has no outstanding dues or obligations to the library as of the date above.`;
    const splitText = doc.splitTextToSize(clearanceText, 170);
    doc.text(splitText, 20, 100);

    doc.text('This user is hereby cleared of all library responsibilities.', 20, 130);

    // Add signature line
    doc.line(140, 160, 190, 160); // Signature line
    doc.text('Librarian Signature', 165, 165, { align: 'center' });

    // Save the PDF
    doc.save(`clearance-certificate-${user.name.replace(/\s/g, '_')}.pdf`);
  };

  /**
   * Issue book to user
   */
const handleIssueBook = async (userId: string, bookId: string, dueDate: string) => {
  const response = await userService.issueBook(userId, bookId, dueDate);
  if (response.success) {
    alert('Book issued successfully!');
    fetchUsers();
  }
};

  /**
   * Return book from user
   */
const handleReturnBook = async (borrowingId: string) => {
  try {
    const response = await userService.returnBook(borrowingId);
    if (response.success) {
      alert('Book returned successfully!');
      fetchUsers();
    } else {
      throw new Error(response.message || 'Failed to return book');
    }
  } catch (error) {
    console.error('Failed to return book:', error);
    alert(`Failed to return book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  /**
   * Get status color classes for user status badges
   */
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'suspended':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  /**
   * Get clearance status color
   */
  const getClearanceColor = (status: string) => {
    switch (status) {
      case 'clear':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'blocked':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  /**
   * Get role icon for user role display
   */
  const getRoleIcon = (role: User['role']) => {
    return role === 'admin' ? ShieldCheckIcon : UserIcon;
  };

  /**
   * Format days left display
   */
  const formatDaysLeft = (days: number): string => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  // User Details Modal Component
  const UserDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onReturnBook: (borrowingId: string) => void;
  }> = ({ isOpen, onClose, user, onReturnBook }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              User Details - {user.name}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                User Information
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                  <p className="text-neutral-900 dark:text-neutral-100">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
                  <p className="text-neutral-900 dark:text-neutral-100">{user.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Role</label>
                  <p className="text-neutral-900 dark:text-neutral-100 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Membership</label>
                  <p className="text-neutral-900 dark:text-neutral-100 capitalize">{user.membershipType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Join Date</label>
                  <p className="text-neutral-900 dark:text-neutral-100">{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Active</label>
                  <p className="text-neutral-900 dark:text-neutral-100">{new Date(user.lastActive).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Borrowing Activity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Borrowing Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Currently Borrowed</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{user.borrowedBooks}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Total Borrows</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{user.totalBorrows}</p>
                </div>
                {user.overdueBooks && user.overdueBooks > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Overdue Books</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{user.overdueBooks}</p>
                  </div>
                )}
                {user.pendingBookings && user.pendingBookings > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{user.pendingBookings}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Borrowings */}
          {user.currentBorrowings && user.currentBorrowings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Current Borrowings
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Book</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Borrowed</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Due Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {user.currentBorrowings.map((borrowing) => (
                      <tr key={borrowing.id}>
                        <td className="px-4 py-2">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{borrowing.bookTitle}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{borrowing.bookAuthor}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">
                          {new Date(borrowing.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">
                          {new Date(borrowing.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            borrowing.status === 'overdue'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {formatDaysLeft(borrowing.daysLeft)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => onReturnBook(borrowing.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Return Book
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Requests */}
          {user.pendingRequests && user.pendingRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Pending Book Requests
              </h3>
              <div className="space-y-2">
                {user.pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{request.bookTitle}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.bookAuthor}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Requested: {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Clearance Check Modal Component
  const ClearanceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onReturnBook: (borrowingId: string) => void;
  }> = ({ isOpen, onClose, user, onReturnBook }) => {
    if (!isOpen) return null;

    const hasOverdueBooks = user.overdueBooks && user.overdueBooks > 0;
    const hasPendingRequests = user.pendingBookings && user.pendingBookings > 0;
    const isClear = user.clearanceStatus === 'clear';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Clearance Check - {user.name}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          </div>

          {/* Clearance Status */}
          <div className="mb-6">
            <div className={`p-4 rounded-lg border-2 ${
              isClear
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : hasOverdueBooks
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
            }`}>
              <div className="flex items-center">
                {isClear && <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />}
                {hasOverdueBooks && <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />}
                {!isClear && !hasOverdueBooks && <ClockIcon className="w-8 h-8 text-yellow-600 mr-3" />}
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isClear ? 'text-green-900 dark:text-green-100'
                    : hasOverdueBooks ? 'text-red-900 dark:text-red-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                  }`}>
                    {isClear ? 'Clearance Approved' : hasOverdueBooks ? 'Clearance Blocked' : 'Clearance Pending'}
                  </h3>
                  <p className={`text-sm ${
                    isClear ? 'text-green-700 dark:text-green-300'
                    : hasOverdueBooks ? 'text-red-700 dark:text-red-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {isClear
                      ? 'User has no outstanding books or overdue items.'
                      : hasOverdueBooks
                      ? 'User has overdue books that must be returned before clearance.'
                      : 'User has pending book requests or active borrowings.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Issues to Resolve */}
          {!isClear && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Issues to Resolve
              </h3>

              {/* Overdue Books */}
              {hasOverdueBooks && user.currentBorrowings && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    Overdue Books ({user.overdueBooks})
                  </h4>
                  <div className="space-y-2">
                    {user.currentBorrowings
                      .filter(b => b.status === 'overdue')
                      .map((borrowing) => (
                        <div key={borrowing.id} className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{borrowing.bookTitle}</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {formatDaysLeft(borrowing.daysLeft)}
                            </p>
                          </div>
                          <button
                            onClick={() => onReturnBook(borrowing.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Return Now
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Active Borrowings */}
              {user.borrowedBooks > 0 && !hasOverdueBooks && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Active Borrowings ({user.borrowedBooks})
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    User has {user.borrowedBooks} books currently borrowed. These must be returned for full clearance.
                  </p>
                </div>
              )}

              {/* Pending Requests */}
              {hasPendingRequests && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    Pending Requests ({user.pendingBookings})
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    User has pending book requests that need to be processed or cancelled.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Clearance Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Last checked: {new Date().toLocaleString()}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
              {isClear && (
                <button
                  onClick={() => {
                    handleGenerateCertificate(user);
                    onClose();
                  }}
                  className="btn-primary"
                >
                  Generate Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit User Modal Component
const EditUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSubmit: (userData: Partial<User>) => void;
}> = ({ isOpen, onClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    status: user.status,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Edit User - {user.name}
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700" disabled={isSubmitting}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="input-field">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="input-field">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  // Add Admin Modal Component
  const AddAdminModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (adminData: { name: string; email: string; phone?: string }) => void;
  }> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name.trim() || !formData.email.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined
        });

        // Reset form
        setFormData({ name: '', email: '', phone: '' });
      } catch (error) {
        console.error('Error submitting admin:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Add New Admin
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter admin's full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="admin@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+251 91 123 4567"
                disabled={isSubmitting}
              />
            </div>

            {/* Admin Role Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Admin Account
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This user will have full administrative privileges
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

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
            {t('admin.users.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage library users and their permissions
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Admin
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Users</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {borrowingStats.totalActiveUsers}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Borrowed Books</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {borrowingStats.totalBorrowedBooks}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Overdue Books</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {borrowingStats.totalOverdueBooks}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Pending Requests</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {borrowingStats.totalPendingRequests}
              </p>
            </div>
          </div>
        </motion.div>
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
                placeholder="Search users by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-40">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Clearance Filter */}
          <div className="sm:w-40">
            <select
              value={selectedClearance}
              onChange={(e) => setSelectedClearance(e.target.value)}
              className="input-field"
            >
              <option value="">All Clearance</option>
              <option value="clear">Clear</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading users...</p>
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Borrowing Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Clearance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Books Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                  {users?.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <motion.tr
                        key={user.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {user.name}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <RoleIcon className="w-4 h-4 mr-2 text-neutral-400" />
                            <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <BookOpenIcon className="w-4 h-4 mr-1 text-blue-500" />
                              <span className="text-neutral-900 dark:text-neutral-100">
                                {user.borrowedBooks} borrowed
                              </span>
                            </div>
                            {user.overdueBooks && user.overdueBooks > 0 && (
                              <div className="flex items-center text-sm">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-red-500" />
                                <span className="text-red-600 dark:text-red-400">
                                  {user.overdueBooks} overdue
                                </span>
                              </div>
                            )}
                            {user.pendingBookings && user.pendingBookings > 0 && (
                              <div className="flex items-center text-sm">
                                <ClockIcon className="w-4 h-4 mr-1 text-yellow-500" />
                                <span className="text-yellow-600 dark:text-yellow-400">
                                  {user.pendingBookings} pending
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getClearanceColor(user.clearanceStatus || 'clear')}`}>
                            {user.clearanceStatus === 'clear' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {user.clearanceStatus === 'blocked' && <XCircleIcon className="w-3 h-3 mr-1" />}
                            {user.clearanceStatus === 'pending' && <ClockIcon className="w-3 h-3 mr-1" />}
                            {user.clearanceStatus || 'clear'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-100">
                            <div>Active: {user.borrowedBooks}</div>
                            <div className="text-xs text-neutral-500">Total: {user.totalBorrows}</div>
                            {user.currentBorrowings && user.currentBorrowings.length > 0 && (
                              <div className="text-xs text-neutral-500 mt-1">
                                Next due: {formatDaysLeft(Math.min(...user.currentBorrowings.map(b => b.daysLeft)))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                              title="View Details & Borrowing History"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleClearanceCheck(user)}
                              className={`transition-colors duration-200 ${
                                user.clearanceStatus === 'blocked'
                                  ? 'text-red-600 hover:text-red-800'
                                  : user.clearanceStatus === 'pending'
                                  ? 'text-yellow-600 hover:text-yellow-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              title="Check Clearance Status"
                            >
                              {user.clearanceStatus === 'blocked' && <XCircleIcon className="w-5 h-5" />}
                              {user.clearanceStatus === 'pending' && <ClockIcon className="w-5 h-5" />}
                              {user.clearanceStatus === 'clear' && <CheckCircleIcon className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-warning-600 dark:hover:text-warning-400 transition-colors duration-200"
                              title="Edit User"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors duration-200"
                              title="Delete User"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {(users?.length === 0) && !loading && (
              <div className="text-center py-12">
                <FunnelIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No users found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {searchQuery || selectedRole || selectedStatus
                    ? 'Try adjusting your search criteria'
                    : 'Start by adding your first admin to the system'
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
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {users?.length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total Users
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {users?.filter(user => user.status === 'active').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Active Users
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {users?.filter(user => user.role === 'admin').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Administrators
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {users?.filter(user => user.status === 'pending').length || 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Pending Approval
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <AddAdminModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAdmin}
        />
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={handleUpdateUser}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onReturnBook={handleReturnBook}
        />
      )}

      {/* Clearance Check Modal */}
      {selectedUser && (
        <ClearanceModal
          isOpen={isClearanceModalOpen}
          onClose={() => {
            setIsClearanceModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onReturnBook={handleReturnBook}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
