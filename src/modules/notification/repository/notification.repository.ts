import { NotificationModel } from "../model/notification.model";
import { INotification } from "../types/notification.types";

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return NotificationModel.create(data);
  }

  async findByRecipient(recipientId: string): Promise<INotification[]> {
    return NotificationModel.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .populate("sender", "username email")
      .populate("post", "text")
      .exec();
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    ).exec();
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<INotification | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: recipientId },
      { $set: { isRead: true } },
      { new: true }
    ).exec();
  }

  async delete(notificationId: string, recipientId: string): Promise<INotification | null> {
    return NotificationModel.findOneAndDelete({ _id: notificationId, recipient: recipientId }).exec();
  }
}
