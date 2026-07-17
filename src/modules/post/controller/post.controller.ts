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

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post ID is required"),
  }),
  body: z.object({
    text: z.string().min(1, "Post content is required").max(500, "Post text cannot exceed 500 characters"),
  }),
});

export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post ID is required"),
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
      const viewerUserId = req.user?.userId;

      const result = await postService.getFeed(page, limit, username, viewerUserId);

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

  async updatePost(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;
      const text = req.body.text;

      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const post = await postService.updatePost(userId, postId, text);

      res.status(200).json({
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

  async deletePost(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;

      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const post = await postService.deletePost(userId, postId);

      res.status(200).json({
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

  async getPostById(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const postId = req.params.id;
      const viewerUserId = req.user?.userId;
      const post = await postService.getPostById(postId, viewerUserId);
      res.status(200).json({
        status: "success",
        data: post,
      });
    } catch (error: any) {
      res.status(404).json({
        status: "fail",
        message: error.message,
      });
    }
  }
}
