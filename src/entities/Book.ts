import mongoose, { Document, Schema } from 'mongoose';
import { BookStatus } from '../types/enums';

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  isbn?: string;
  code?: string;
  description: string;
  category: string;
  status: BookStatus;
  coverImage?: string;
  publisher?: string;
  publishedDate?: Date;
  pageCount?: number;
  language: string;
  tags: string[];
  rating?: {
    average: number;
    count: number;
  };
  availability: {
    totalCopies: number;
    availableCopies: number;
    reservedCopies: number;
  };
  location?: {
    shelf: string;
    section: string;
    floor?: string;
  };
  metadata: {
    addedBy: mongoose.Types.ObjectId;
    lastUpdatedBy?: mongoose.Types.ObjectId;
    totalBookings: number;
    popularityScore: number;
  };
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isAvailable(): boolean;
  updateAvailability(change: number): Promise<void>;
  calculatePopularityScore(): number;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [1, 'Author cannot be empty'],
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow multiple null values
      match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Please provide a valid ISBN'],
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow multiple null values
      maxlength: [50, 'Code cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Self-Help',
        'Business',
        'Health',
        'Travel',
        'Cooking',
        'Art',
        'Music',
        'Sports',
        'Religion',
        'Philosophy',
        'Psychology',
        'Education',
        'Children',
        'Young Adult',
        'Romance',
        'Mystery',
        'Thriller',
        'Horror',
        'Fantasy',
        'Science Fiction',
        'Other',
      ],
    },
    status: {
      type: String,
      enum: Object.values(BookStatus),
      default: BookStatus.AVAILABLE,
    },
    coverImage: {
      type: String,
      default: null,
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher cannot exceed 100 characters'],
    },
    publishedDate: {
      type: Date,
    },
    pageCount: {
      type: Number,
      min: [1, 'Page count must be at least 1'],
      max: [10000, 'Page count cannot exceed 10000'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      default: 'English',
      maxlength: [50, 'Language cannot exceed 50 characters'],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters'],
    }],
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    availability: {
      totalCopies: {
        type: Number,
        required: [true, 'Total copies is required'],
        min: [1, 'Total copies must be at least 1'],
        default: 1,
      },
      availableCopies: {
        type: Number,
        required: [true, 'Available copies is required'],
        min: [0, 'Available copies cannot be negative'],
        default: 1,
      },
      reservedCopies: {
        type: Number,
        min: [0, 'Reserved copies cannot be negative'],
        default: 0,
      },
    },
    location: {
      shelf: {
        type: String,
        required: [true, 'Shelf location is required'],
        trim: true,
      },
      section: {
        type: String,
        required: [true, 'Section is required'],
        trim: true,
      },
      floor: {
        type: String,
        trim: true,
        default: 'Ground Floor',
      },
    },
    metadata: {
      addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Added by user is required'],
      },
      lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      totalBookings: {
        type: Number,
        min: 0,
        default: 0,
      },
      popularityScore: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add a virtual `id` property.
bookSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ 'availability.availableCopies': 1 });
bookSchema.index({ 'metadata.popularityScore': -1 });
bookSchema.index({ 'rating.average': -1 });
bookSchema.index({ createdAt: -1 });
// ISBN already has unique: true and sparse: true in schema definition

// Validation
bookSchema.pre('save', function(next) {
  // Ensure available copies doesn't exceed total copies
  if (this.availability.availableCopies > this.availability.totalCopies) {
    return next(new Error('Available copies cannot exceed total copies'));
  }
  
  // Update status based on availability
  if (this.availability.availableCopies === 0) {
    this.status = BookStatus.BOOKED;
  } else if (this.status === BookStatus.BOOKED && this.availability.availableCopies > 0) {
    this.status = BookStatus.AVAILABLE;
  }
  
  // Calculate popularity score
  this.metadata.popularityScore = this.calculatePopularityScore();
  
  next();
});

// Instance methods
bookSchema.methods.isAvailable = function(): boolean {
  return this.status === BookStatus.AVAILABLE && this.availability.availableCopies > 0;
};

bookSchema.methods.updateAvailability = async function(change: number): Promise<void> {
  this.availability.availableCopies += change;
  
  if (this.availability.availableCopies < 0) {
    throw new Error('Available copies cannot be negative');
  }
  
  if (this.availability.availableCopies > this.availability.totalCopies) {
    throw new Error('Available copies cannot exceed total copies');
  }
  
  await this.save();
};

bookSchema.methods.calculatePopularityScore = function(): number {
  const bookingWeight = 0.6;
  const ratingWeight = 0.4;
  
  const bookingScore = Math.min(this.metadata.totalBookings * 10, 100);
  const ratingScore = this.rating.count > 0 ? (this.rating.average / 5) * 100 : 0;
  
  return Math.round(bookingScore * bookingWeight + ratingScore * ratingWeight);
};

export const Book = mongoose.model<IBook>('Book', bookSchema);
