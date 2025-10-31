import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Book } from '../../services/bookService';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSubmit: (data: Partial<Book>) => void;
  categories: string[];
}

const EditBookModal: React.FC<EditBookModalProps> = ({ isOpen, onClose, book, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    description: book.description || '',
    category: book.category || '',
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    publishedDate: book.publishedDate || '',
    pageCount: book.pageCount || 0,
    language: book.language || 'English',
    availability: {
      totalCopies: book.availability?.totalCopies || 1,
      availableCopies: book.availability?.availableCopies || 1,
      reservedCopies: book.availability?.reservedCopies || 0,
    },
    location: {
      shelf: book.location?.shelf || '',
      section: book.location?.section || '',
      floor: book.location?.floor || '1',
    },
    status: book.status || 'available',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.startsWith('availability.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: parseInt(value) || 0,
        },
      }));
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else if (name === 'pageCount') {
      setFormData(prev => ({ ...prev, pageCount: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Edit Book</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField name="title" label="Title *" value={formData.title} onChange={handleChange} required />
          <InputField name="author" label="Author *" value={formData.author} onChange={handleChange} required />
          <InputField name="isbn" label="ISBN" value={formData.isbn} onChange={handleChange} />
          <SelectField name="category" label="Category *" value={formData.category} onChange={handleChange} required options={categories} />
          <SelectField name="status" label="Status" value={formData.status} onChange={handleChange} options={['available','borrowed','maintenance','lost']} />
          <TextareaField name="description" label="Description" value={formData.description} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <InputField name="publisher" label="Publisher" value={formData.publisher} onChange={handleChange} />
            <InputField name="publishedDate" label="Publication Date" value={formData.publishedDate} onChange={handleChange} type="date" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField name="pageCount" label="Pages" value={formData.pageCount} onChange={handleChange} type="number" min={1} />
            <InputField name="language" label="Language" value={formData.language} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InputField name="availability.totalCopies" label="Total Copies" value={formData.availability.totalCopies} onChange={handleChange} type="number" min={1} />
            <InputField name="availability.availableCopies" label="Available Copies" value={formData.availability.availableCopies} onChange={handleChange} type="number" min={0} />
            <InputField name="availability.reservedCopies" label="Reserved Copies" value={formData.availability.reservedCopies} onChange={handleChange} type="number" min={0} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InputField name="location.shelf" label="Shelf" value={formData.location.shelf} onChange={handleChange} />
            <InputField name="location.section" label="Section" value={formData.location.section} onChange={handleChange} />
            <InputField name="location.floor" label="Floor" value={formData.location.floor} onChange={handleChange} />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Update Book</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Components
const InputField: React.FC<{ name: string; label: string; value: any; onChange: any; type?: string; min?: number; required?: boolean }> = ({ name, label, value, onChange, type = 'text', min, required }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} min={min} required={required} className="input-field" />
  </div>
);

const SelectField: React.FC<{ name: string; label: string; value: any; onChange: any; options: string[]; required?: boolean }> = ({ name, label, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange} required={required} className="input-field">
      <option value="">Select {label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const TextareaField: React.FC<{ name: string; label: string; value: any; onChange: any }> = ({ name, label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={3} className="input-field" />
  </div>
);

export default EditBookModal;
