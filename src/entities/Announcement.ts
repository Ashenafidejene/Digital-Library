import { Schema, model, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishDate: Date;
  expiryDate?: Date;
  authorId: string;
  authorName: string;
  targetAudience: 'all' | 'members' | 'staff';
  image?: string;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    targetAudience: {
      type: String,
      enum: ['all', 'members', 'staff'],
      default: 'all',
    },
    image: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Announcement = model<IAnnouncement>('Announcement', AnnouncementSchema);
