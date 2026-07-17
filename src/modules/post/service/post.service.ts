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

  async getFeed(page: number = 1, limit: number = 10, username?: string): Promise<{ posts: IPost[]; total: number; page: number; limit: number }> {
    const { posts, total } = await postRepository.findAllPaginated(page, limit, username);
    return {
      posts,
      total,
      page,
      limit,
    };
  }
}
