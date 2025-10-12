import React from 'react';
import { Book } from '../../services/bookService';

interface ViewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

const ViewBookModal: React.FC<ViewBookModalProps> = ({ isOpen, onClose, book }) => {
  if (!isOpen || !book) return null;

  const formatLocation = (location?: Book['location']) => {
    if (!location) return 'N/A';
    return `${location.shelf || '-'} / ${location.section || '-'} / Floor ${location.floor || '1'}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'borrowed': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Book Details</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">✕</button>
        </div>

        <div className="space-y-4">
          <Field label="Title" value={book.title || 'N/A'} />
          <Field label="Author" value={book.author || 'N/A'} />
          <Field label="ISBN" value={book.isbn || 'N/A'} />
          <Field label="Category" value={book.category || 'N/A'} />
          <Field label="Status" value={<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(book.status)}`}>{book.status}</span>} />
          <Field label="Description" value={book.description || 'No description available'} />
          <Field label="Publisher" value={book.publisher || 'N/A'} />
          <Field label="Publication Date" value={book.publishedDate || 'N/A'} />
          <Field label="Pages" value={book.pageCount ?? 'N/A'} />
          <Field label="Language" value={book.language || 'N/A'} />
          <Field label="Location" value={formatLocation(book.location)} />
          <Field label="Availability" value={`${book.availability?.availableCopies ?? 0} available out of ${book.availability?.totalCopies ?? 0} total copies`} />
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

// Reusable Field Component
const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
    <div className="text-neutral-900 dark:text-neutral-100">{value}</div>
  </div>
);

export default ViewBookModal;