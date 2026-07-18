import { getFirebaseMessaging } from "../../../config/firebase";
import { UserRepository } from "../../user/repository/user.repository";
import { NotificationRepository } from "../repository/notification.repository";
import { INotification } from "../types/notification.types";

const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();

export class NotificationService {
  async createNotification(
    recipientId: string,
    senderId: string,
    type: "like" | "comment",
    postId: string,
    text: string
  ): Promise<INotification> {
    // 1. Persist notification in database
    const notification = await notificationRepository.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      isRead: false,
      text,
    });

    // 2. Dispatch push notification with data payload (non-blocking)
    const title = type === "like" ? "New Like! ❤️" : "New Comment! 💬";
    this.sendPushNotification(
      recipientId,
      title,
      text,
      { postId: postId.toString(), type }
    ).catch((err) =>
      console.error("FCM Push dispatch error:", err)
    );

    return notification;
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return notificationRepository.findByRecipient(userId);
  }

  async markNotificationsAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId: string, recipientId: string): Promise<INotification | null> {
    return notificationRepository.delete(notificationId, recipientId);
  }

  async sendPushNotification(
    targetUserId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    try {
      const user = await userRepository.findById(targetUserId);
      if (!user || !user.fcmToken) {
        console.log(`Notification skipped: User ${targetUserId} has no registered FCM token.`);
        return;
      }

      const messaging = getFirebaseMessaging();
      if (!messaging) {
        console.warn("Notification skipped: Firebase Admin SDK messaging is not initialized.");
        return;
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: user.fcmToken,
      };

      const response = await messaging.send(message);
      console.log("Successfully sent push notification:", response);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}
