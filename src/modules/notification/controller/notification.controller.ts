import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../common/middlewares/auth.middleware";
import { NotificationService } from "../service/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const notifications = await notificationService.getUserNotifications(userId);
      res.status(200).json({
        status: "success",
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      await notificationService.markNotificationsAsRead(userId);
      res.status(200).json({
        status: "success",
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notificationId = req.params.id;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const deleted = await notificationService.deleteNotification(notificationId, userId);
      if (!deleted) {
        res.status(404).json({ status: "fail", message: "Notification not found" });
        return;
      }

      res.status(200).json({
        status: "success",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
}
