import { Router } from "express";
import { CommentController, addCommentSchema } from "../controller/comment.controller";
import { protect } from "../../../common/middlewares/auth.middleware";
import { validate } from "../../../common/middlewares/validation.middleware";

const router = Router();
const commentController = new CommentController();

// Route format: POST /posts/:id/comment
router.post("/:id/comment", protect as any, validate(addCommentSchema), commentController.addComment as any);

// Get comments for a post
router.get("/:id/comments", protect as any, commentController.getComments as any);

export default router;
