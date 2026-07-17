import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../common/middlewares/auth.middleware";
import { UserService } from "../service/user.service";

const userService = new UserService();

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
}
