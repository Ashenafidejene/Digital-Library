import React, { useState } from 'react';

interface SimpleAddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookData: any) => void;
}

const SimpleAddBookModal: React.FC<SimpleAddBookModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isbn, setIsbn] = useState('');
  const [code, setCode] = useState('');
  const [shelfNumber, setShelfNumber] = useState('');
  const [section, setSection] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !author || !category || !code || !shelfNumber || !section) {
      alert('Please fill in all required fields (Title, Author, Category, Book Code, Shelf Number, Section)');
      return;
    }

    // Validate description length
    if (description && description.trim().length < 10) {
      alert('Description must be at least 10 characters long');
      return;
    }

    // Validate ISBN if provided
    if (isbn && isbn.trim() && !/^(?:\d{9}[\dX]|\d{13})$/.test(isbn.trim())) {
      alert('Please provide a valid ISBN (10 or 13 digits)');
      return;
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      category,
      description: description.trim() || 'No description provided',
      isbn: isbn.trim() || undefined, // Only send if provided and valid
      code: code.trim(), // Add unique book code
      shelfNumber: shelfNumber.trim(),
      section: section.trim(),
      totalCopies: parseInt(totalCopies.toString()) || 1,
      language: 'English',
    };

    onSubmit(bookData);

    // Reset form
    setTitle('');
    setAuthor('');
    setCategory('');
    setDescription('');
    setIsbn('');
    setCode('');
    setShelfNumber('');
    setSection('');
    setTotalCopies(1);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl z-10 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
          Add New Book
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              placeholder="Enter book title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Author *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              placeholder="Enter author name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              required
            >
              <option value="">Select category</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Biography">Biography</option>
              <option value="Ethiopian Literature">Ethiopian Literature</option>
              <option value="Children">Children</option>
              <option value="Reference">Reference</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              placeholder="Enter book description (minimum 10 characters)"
              rows={3}
              required
              minLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Book Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., BK-001, LIB-2024-001"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Unique identifier for this book</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                ISBN (Optional)
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., 9780123456789"
              />
              <p className="text-xs text-neutral-500 mt-1">10 or 13 digit ISBN (optional)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Shelf Number *
              </label>
              <input
                type="text"
                value={shelfNumber}
                onChange={(e) => setShelfNumber(e.target.value)}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., A-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Section *
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., Fiction, Science, History"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Number of Copies *
            </label>
            <input
              type="number"
              value={totalCopies}
              onChange={(e) => setTotalCopies(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              min="1"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleAddBookModal;
