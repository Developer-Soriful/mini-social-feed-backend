import { Router } from "express";
import { PostController, createPostSchema, getFeedSchema } from "../controller/post.controller";
import { protect } from "../../../common/middlewares/auth.middleware";
import { validate } from "../../../common/middlewares/validation.middleware";

const router = Router();
const postController = new PostController();

// Create post requires authentication
router.post("/", protect as any, validate(createPostSchema), postController.createPost as any);

// Feed requires authentication
router.get("/", protect as any, validate(getFeedSchema), postController.getFeed as any);

export default router;
