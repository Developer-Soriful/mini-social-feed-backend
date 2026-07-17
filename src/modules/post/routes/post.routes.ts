import { Router } from "express";
import { 
  PostController, 
  createPostSchema, 
  getFeedSchema, 
  updatePostSchema, 
  deletePostSchema 
} from "../controller/post.controller";
import { protect } from "../../../common/middlewares/auth.middleware";
import { validate } from "../../../common/middlewares/validation.middleware";

const router = Router();
const postController = new PostController();

// Create post requires authentication
router.post("/", protect as any, validate(createPostSchema), postController.createPost as any);

// Feed requires authentication
router.get("/", protect as any, validate(getFeedSchema), postController.getFeed as any);

// Edit and Delete require ownership validation
router.put("/:id", protect as any, validate(updatePostSchema), postController.updatePost as any);
router.delete("/:id", protect as any, validate(deletePostSchema), postController.deletePost as any);

// Fetch post by ID
router.get("/:id", protect as any, postController.getPostById as any);

export default router;
