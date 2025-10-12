import { Schema, model, Document } from 'mongoose';
import { IUser } from './User';

export interface Notification extends Document {
  user: IUser['_id'];
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<Notification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const NotificationModel = model<Notification>('Notification', NotificationSchema);
