import { Schema, model, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  status: 'upcoming' | 'past' | 'cancelled';
  authorId: string;
  authorName: string;
  image?: string;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    organizer: { type: String, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'past', 'cancelled'],
      default: 'upcoming',
    },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
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

export const Event = model<IEvent>('Event', EventSchema);
