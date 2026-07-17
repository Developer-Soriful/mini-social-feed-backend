import { PostModel } from "../model/post.model";
import { UserModel } from "../../user/model/user.model";
import { IPost, CreatePostInput } from "../types/post.types";

export class PostRepository {
  async create(input: CreatePostInput): Promise<IPost> {
    return PostModel.create(input);
  }

  async findById(id: string): Promise<IPost | null> {
    return PostModel.findById(id).populate("author", "username email").exec();
  }

  async incrementLikes(postId: string): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } }, { new: true }).exec();
  }

  async decrementLikes(postId: string): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } }, { new: true }).exec();
  }

  async incrementComments(postId: string): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }, { new: true }).exec();
  }

  async findAllPaginated(page: number, limit: number, username?: string): Promise<{ posts: IPost[]; total: number }> {
    let query: any = {};

    if (username) {
      const user = await UserModel.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } }).exec();
      if (!user) {
        return { posts: [], total: 0 };
      }
      query.author = user._id;
    }

    const skip = (page - 1) * limit;
    const total = await PostModel.countDocuments(query).exec();
    const posts = await PostModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username email fcmToken")
      .exec();

    return { posts, total };
  }
}
