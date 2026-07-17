import { Router } from "express";
import { LikeController } from "../controller/like.controller";
import { protect } from "../../../common/middlewares/auth.middleware";

const router = Router();
const likeController = new LikeController();

// Route format: POST /posts/:id/like
router.post("/:id/like", protect as any, likeController.toggleLike as any);

export default router;
