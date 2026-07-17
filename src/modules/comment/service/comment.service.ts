import { CommentRepository } from "../repository/comment.repository";
import { PostRepository } from "../../post/repository/post.repository";
import { NotificationService } from "../../notification/service/notification.service";
import { IComment } from "../model/comment.model";

const commentRepository = new CommentRepository();
const postRepository = new PostRepository();
const notificationService = new NotificationService();

export class CommentService {
  async addComment(userId: string, username: string, postId: string, text: string): Promise<IComment> {
    if (!text || text.trim().length === 0) {
      throw new Error("Comment text cannot be empty");
    }

    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const comment = await commentRepository.create(userId, postId, text);
    await postRepository.incrementComments(postId);

    // Trigger push notification if commenter is not the post author
    const postAuthorId = post.author.toString();
    if (postAuthorId !== userId) {
      await notificationService.sendPushNotification(
        postAuthorId,
        "New Comment! 💬",
        `${username} commented: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`
      );
    }

    return comment;
  }
}
