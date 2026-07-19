import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../common/middlewares/auth.middleware";
import { LikeService } from "../service/like.service";

const likeService = new LikeService();

export class LikeController {
  async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const username = req.user?.username;
      const postId = req.params.id;

      if (!userId || !username) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const result = await likeService.toggleLike(userId, username, postId);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
