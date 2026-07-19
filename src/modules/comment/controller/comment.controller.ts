import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../common/middlewares/auth.middleware";
import { CommentService } from "../service/comment.service";
import { z } from "zod";

export const addCommentSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Comment text is required").max(280, "Comment cannot exceed 280 characters"),
  }),
});

const commentService = new CommentService();

export class CommentController {
  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const username = req.user?.username;
      const postId = req.params.id;

      if (!userId || !username) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const comment = await commentService.addComment(userId, username, postId, req.body.text);

      res.status(201).json({
        status: "success",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params.id;
      const comments = await commentService.getComments(postId);
      res.status(200).json({
        status: "success",
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }
}
