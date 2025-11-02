import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  library: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  borrowing: {
    maxBooksPerUser: number;
    defaultBorrowPeriodDays: number;
    maxRenewals: number;
    finePerDay: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    overdueReminders: boolean;
  };
  system: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
  };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    library: {
      name: { type: String, default: 'Digital Library' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    borrowing: {
      maxBooksPerUser: { type: Number, default: 5 },
      defaultBorrowPeriodDays: { type: Number, default: 14 },
      maxRenewals: { type: Number, default: 2 },
      finePerDay: { type: Number, default: 2.0 },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      overdueReminders: { type: Boolean, default: true },
    },
    system: {
      maintenanceMode: { type: Boolean, default: false },
      allowRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
