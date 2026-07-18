import { Router } from "express";
import { NotificationController } from "../controller/notification.controller";
import { protect } from "../../../common/middlewares/auth.middleware";

const router = Router();
const notificationController = new NotificationController();

router.get("/", protect as any, notificationController.getNotifications as any);
router.patch("/read", protect as any, notificationController.markAsRead as any);
router.delete("/:id", protect as any, notificationController.deleteNotification as any);

export default router;
