import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookData: any) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    isbn: '',
    publisher: '',
    publishedDate: '',
    pageCount: 0,
    language: 'English',
    availability: {
      totalCopies: 1,
      availableCopies: 1
    },
    location: {
      shelf: '',
      section: '',
      floor: '1'
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.startsWith('availability.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: parseInt(value) || 0
        }
      }));
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else if (name === 'tags') {
      setFormData(prev => ({
        ...prev,
        tags: value.split(',').map(tag => tag.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'pageCount' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category) {
      alert('Please fill in all required fields (Title, Author, Category)');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      author: '',
      description: '',
      category: '',
      isbn: '',
      publisher: '',
      publishedDate: '',
      pageCount: 0,
      language: 'English',
      availability: { totalCopies: 1, availableCopies: 1 },
      location: { shelf: '', section: '', floor: '1' }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-neutral-500 bg-opacity-75"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="relative z-10 w-full max-w-2xl p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Add New Book</h3>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <InputField name="title" label="Title *" value={formData.title} onChange={handleChange} required placeholder="Enter book title" />
              {/* Author */}
              <InputField name="author" label="Author *" value={formData.author} onChange={handleChange} required placeholder="Enter author name" />
              {/* ISBN */}
              <InputField name="isbn" label="ISBN" value={formData.isbn} onChange={handleChange} placeholder="Enter ISBN" />
            
              <SelectField name="category" label="Category *" value={formData.category} onChange={handleChange} required options={['Fiction','Non-Fiction','Science','History','Biography','Ethiopian Literature','Children','Reference']} />
              {/* Publisher */}
              <InputField name="publisher" label="Publisher" value={formData.publisher} onChange={handleChange} placeholder="Enter publisher" />
              {/* Published Date */}
              <InputField name="publishedDate" label="Published Date" value={formData.publishedDate} onChange={handleChange} type="date" />
              {/* Page Count */}
              <InputField name="pageCount" label="Page Count" value={formData.pageCount} onChange={handleChange} type="number" placeholder="Number of pages" />
              {/* Language */}
              <SelectField name="language" label="Language" value={formData.language} onChange={handleChange} options={['English','Amharic','Oromo','Tigrinya','French','Arabic']} />
              {/* Availability */}
              <InputField
  name="availability.totalCopies"
  label="Copies *"
  value={formData.availability.totalCopies}
  onChange={e => {
    const val = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      availability: {
        totalCopies: val,
        availableCopies: val, // same value
      },
    }));
  }}
  type="number"
  min={1}
  required
/>
              
              {/* Location */}
              <InputField name="location.shelf" label="Shelf" value={formData.location.shelf} onChange={handleChange} placeholder="Shelf ID" />
              <InputField name="location.section" label="Section" value={formData.location.section} onChange={handleChange} placeholder="Section" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field" placeholder="Enter book description" />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Book</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
interface FieldProps {
  name: string;
  label: string;
  value: any;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
}

const InputField: React.FC<FieldProps> = ({ name, label, value, onChange, type = 'text', placeholder, required, min }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      className="input-field"
    />
  </div>
);

const SelectField: React.FC<FieldProps> = ({ name, label, value, onChange, options = [], required }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <select name={name} value={value} onChange={onChange} required={required} className="input-field">
      <option value="">Select {label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default AddBookModal;
