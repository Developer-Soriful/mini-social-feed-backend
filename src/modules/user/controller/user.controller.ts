import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../common/middlewares/auth.middleware";
import { UserService } from "../service/user.service";

const userService = new UserService();

export const updateProfileSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .optional(),
      bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
      headline: z.string().max(120, "Headline cannot exceed 120 characters").optional(),
    })
    .refine(
      (data) => data.username !== undefined || data.bio !== undefined || data.headline !== undefined,
      { message: "At least one field must be provided" }
    ),
});

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const profile = await userService.getProfile(userId);
      res.status(200).json({
        status: "success",
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "User not authenticated" });
        return;
      }

      const { username, bio, headline } = req.body;
      const profile = await userService.updateProfile(userId, { username, bio, headline });

      res.status(200).json({
        status: "success",
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  }
}
