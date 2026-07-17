import { getFirebaseMessaging } from "../../../config/firebase";
import { UserRepository } from "../../user/repository/user.repository";

const userRepository = new UserRepository();

export class NotificationService {
  async sendPushNotification(targetUserId: string, title: string, body: string): Promise<void> {
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
        token: user.fcmToken,
      };

      const response = await messaging.send(message);
      console.log("Successfully sent push notification:", response);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}
