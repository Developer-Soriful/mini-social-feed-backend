import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../common/middlewares/auth.middleware";
import { PostService } from "../service/post.service";
import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Post content is required").max(500, "Post text cannot exceed 500 characters"),
  }),
});

export const getFeedSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    username: z.string().optional(),
  }),
});

const postService = new PostService();

export class PostController {
  async createPost(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const post = await postService.createPost({
        text: req.body.text,
        author: userId,
      });

      res.status(201).json({
        status: "success",
        data: post,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  }

  async getFeed(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const page = (req.query.page as unknown) as number;
      const limit = (req.query.limit as unknown) as number;
      const username = req.query.username as string | undefined;

      const result = await postService.getFeed(page, limit, username);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  }
}
