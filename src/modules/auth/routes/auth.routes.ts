import { Router } from "express";
import { AuthController, signupSchema, loginSchema } from "../controller/auth.controller";
import { validate } from "../../../common/middlewares/validation.middleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);

export default router;
