import { LikeRepository } from "../repository/like.repository";
import { PostRepository } from "../../post/repository/post.repository";
import { NotificationService } from "../../notification/service/notification.service";

const likeRepository = new LikeRepository();
const postRepository = new PostRepository();
const notificationService = new NotificationService();

export class LikeService {
  async toggleLike(userId: string, username: string, postId: string): Promise<{ liked: boolean }> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const alreadyLiked = await likeRepository.exists(userId, postId);

    if (alreadyLiked) {
      await likeRepository.delete(userId, postId);
      await postRepository.decrementLikes(postId);
      return { liked: false };
    } else {
      await likeRepository.create(userId, postId);
      await postRepository.incrementLikes(postId);

      // Trigger push notification if the user is not liking their own post
      const postAuthorId = post.author.toString();
      if (postAuthorId !== userId) {
        // Find author FCM info, populate or directly fetch is handled in sendPushNotification
        await notificationService.sendPushNotification(
          postAuthorId,
          "New Like! ❤️",
          `${username} liked your post: "${post.text.substring(0, 30)}${post.text.length > 30 ? "..." : ""}"`
        );
      }

      return { liked: true };
    }
  }
}
