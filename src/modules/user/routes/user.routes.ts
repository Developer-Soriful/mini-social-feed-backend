import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { protect } from "../../../common/middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

router.get("/profile", protect as any, userController.getProfile as any);

export default router;
