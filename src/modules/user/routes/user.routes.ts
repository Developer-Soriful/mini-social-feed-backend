import { Router } from "express";
import { UserController, updateProfileSchema } from "../controller/user.controller";
import { protect } from "../../../common/middlewares/auth.middleware";
import { validate } from "../../../common/middlewares/validation.middleware";

const router = Router();
const userController = new UserController();

router.get("/profile", protect as any, userController.getProfile as any);
router.patch("/profile", protect as any, validate(updateProfileSchema), userController.updateProfile as any);

export default router;
