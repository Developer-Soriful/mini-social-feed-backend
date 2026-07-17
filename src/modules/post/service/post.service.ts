import { PostRepository } from "../repository/post.repository";
import { IPost, CreatePostInput } from "../types/post.types";

const postRepository = new PostRepository();

export class PostService {
  async createPost(input: CreatePostInput): Promise<IPost> {
    if (!input.text || input.text.trim().length === 0) {
      throw new Error("Post text content cannot be empty");
    }
    return postRepository.create(input);
  }

  async getFeed(page: number = 1, limit: number = 10, username?: string, viewerUserId?: string): Promise<{ posts: (IPost & { isLiked: boolean })[]; total: number; page: number; limit: number }> {
    const { posts, total } = await postRepository.findAllPaginated(page, limit, username, viewerUserId);
    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async updatePost(userId: string, postId: string, text: string): Promise<IPost> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Security Guard: Check if requester is the post author
    const authorId = (post.author as any)._id ? (post.author as any)._id.toString() : post.author.toString();
    if (authorId !== userId) {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Post text content cannot be empty");
    }

    const updated = await postRepository.update(postId, text);
    if (!updated) {
      throw new Error("Failed to update post");
    }
    return updated;
  }

  async deletePost(userId: string, postId: string): Promise<IPost> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Security Guard: Check if requester is the post author
    const authorId = (post.author as any)._id ? (post.author as any)._id.toString() : post.author.toString();
    if (authorId !== userId) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    const deleted = await postRepository.delete(postId);
    if (!deleted) {
      throw new Error("Failed to delete post");
    }
    return deleted;
  }

  async getPostById(postId: string, viewerUserId?: string): Promise<IPost & { isLiked: boolean }> {
    const post = await postRepository.findById(postId, viewerUserId);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }
}
