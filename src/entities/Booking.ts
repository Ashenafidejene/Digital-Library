import mongoose, { Document, Schema } from 'mongoose';
import { BookingStatus } from '../types';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  status: BookingStatus;
  requestDate: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  borrowDate?: Date;
  dueDate?: Date;
  returnDate?: Date;
  notes?: string;
  adminNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedBy?: mongoose.Types.ObjectId;
  borrowPeriodDays: number;
  renewalCount: number;
  maxRenewals: number;
  fineAmount: number;
  finePaid: boolean;
  rating?: number;
  metadata: {
    requestSource: 'web' | 'mobile' | 'admin';
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  user?: any;
  book?: any;

  // Instance methods
  isOverdue(): boolean;
  calculateFine(): number;
  canBeRenewed(): boolean;
  getDaysUntilDue(): number;
  approve(adminId: mongoose.Types.ObjectId, notes?: string): Promise<void>;
  reject(adminId: mongoose.Types.ObjectId, reason: string): Promise<void>;
  markAsBorrowed(): Promise<void>;
  markAsReturned(): Promise<void>;
  renew(days?: number): Promise<void>;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
    },
    rejectedDate: {
      type: Date,
    },
    borrowDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    borrowPeriodDays: {
      type: Number,
      required: [true, 'Borrow period is required'],
      min: [1, 'Borrow period must be at least 1 day'],
      max: [90, 'Borrow period cannot exceed 90 days'],
      default: 14, // 2 weeks default
    },
    renewalCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxRenewals: {
      type: Number,
      min: 0,
      default: 2,
    },
    fineAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    metadata: {
      requestSource: {
        type: String,
        enum: ['web', 'mobile', 'admin'],
        default: 'web',
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ bookId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ requestDate: -1 });
bookingSchema.index({ dueDate: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ bookId: 1, status: 1 });

// Compound index for preventing duplicate active bookings
bookingSchema.index(
  { userId: 1, bookId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [BookingStatus.PENDING, BookingStatus.APPROVED] }
    }
  }
);

// Virtual populate
bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

bookingSchema.virtual('book', {
  ref: 'Book',
  localField: 'bookId',
  foreignField: '_id',
  justOne: true,
});

// Pre-save middleware
bookingSchema.pre<IBooking>('save', function(next) {
  // Set due date when status changes to approved
  if (this.isModified('status') && this.status === BookingStatus.APPROVED && !this.dueDate) {
    this.borrowDate = new Date();
    this.dueDate = new Date(Date.now() + this.borrowPeriodDays * 24 * 60 * 60 * 1000);
    this.approvedDate = new Date();
  }

  // Calculate fine if overdue
  if (this.status === BookingStatus.OVERDUE || this.isOverdue()) {
    this.fineAmount = this.calculateFine();
    if (this.status !== BookingStatus.RETURNED) {
      this.status = BookingStatus.OVERDUE;
    }
  }

  next();
});

// Instance methods
bookingSchema.methods.isOverdue = function(): boolean {
  if (!this.dueDate || this.status === BookingStatus.RETURNED) {
    return false;
  }
  return new Date() > this.dueDate;
};

bookingSchema.methods.calculateFine = function(): number {
  if (!this.dueDate || !this.isOverdue()) {
    return 0;
  }

  const overdueDays = Math.ceil((Date.now() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const finePerDay = 0.50; // $0.50 per day
  const maxFine = 25.00; // Maximum fine of $25

  return Math.min(overdueDays * finePerDay, maxFine);
};

bookingSchema.methods.canBeRenewed = function(): boolean {
  return (
    this.status === BookingStatus.APPROVED &&
    this.renewalCount < this.maxRenewals &&
    !this.isOverdue() &&
    this.fineAmount === 0
  );
};

bookingSchema.methods.getDaysUntilDue = function(): number {
  if (!this.dueDate) {
    return 0;
  }
  const diffTime = this.dueDate.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

bookingSchema.methods.approve = async function(adminId: mongoose.Types.ObjectId, notes?: string): Promise<void> {
  this.status = BookingStatus.APPROVED;
  this.approvedBy = adminId;
  this.approvedDate = new Date();
  this.borrowDate = new Date();
  this.dueDate = new Date(Date.now() + this.borrowPeriodDays * 24 * 60 * 60 * 1000);
  
  if (notes) {
    this.adminNotes = notes;
  }
  
  await this.save();
};

bookingSchema.methods.reject = async function(adminId: mongoose.Types.ObjectId, reason: string): Promise<void> {
  this.status = BookingStatus.REJECTED;
  this.rejectedBy = adminId;
  this.rejectedDate = new Date();
  this.adminNotes = reason;
  
  await this.save();
};

bookingSchema.methods.markAsBorrowed = async function(): Promise<void> {
  if (this.status !== BookingStatus.APPROVED) {
    throw new Error('Booking must be approved before it can be marked as borrowed');
  }
  
  this.borrowDate = new Date();
  await this.save();
};

bookingSchema.methods.markAsReturned = async function(): Promise<void> {
  this.status = BookingStatus.RETURNED;
  this.returnDate = new Date();
  
  await this.save();
};

bookingSchema.methods.renew = async function(days?: number): Promise<void> {
  if (!this.canBeRenewed()) {
    throw new Error('Booking cannot be renewed');
  }
  
  const renewalDays = days || this.borrowPeriodDays;
  
  this.renewalCount += 1;
  this.dueDate = new Date(this.dueDate!.getTime() + renewalDays * 24 * 60 * 60 * 1000);
  
  await this.save();
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
