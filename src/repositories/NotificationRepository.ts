import { Notification, NotificationModel } from '../entities/Notification';

export class NotificationRepository {
  async create(userId: string, message: string): Promise<Notification> {
    const notification = new NotificationModel({ user: userId, message });
    return notification.save();
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    return NotificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }
}
