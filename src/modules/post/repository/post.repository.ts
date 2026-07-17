import { PostModel } from "../model/post.model";
import { UserModel } from "../../user/model/user.model";
import { CommentModel } from "../../comment/model/comment.model";
import { LikeModel } from "../../like/model/like.model";
import { IPost, CreatePostInput } from "../types/post.types";

export class PostRepository {
  async create(input: CreatePostInput): Promise<IPost> {
    return PostModel.create(input);
  }

  async findById(id: string, viewerUserId?: string): Promise<(IPost & { isLiked: boolean }) | null> {
    const post = await PostModel.findById(id).populate("author", "username email").lean().exec();
    if (!post) return null;
    let isLiked = false;
    if (viewerUserId) {
      const like = await LikeModel.findOne({ userId: viewerUserId, postId: id }).lean().exec();
      isLiked = !!like;
    }
    return { ...post, isLiked } as any;
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

  async findAllPaginated(page: number, limit: number, username?: string, viewerUserId?: string): Promise<{ posts: (IPost & { isLiked: boolean })[]; total: number }> {
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
      .lean()
      .exec();

    // Batch-fetch which of these posts the viewer has liked in ONE query
    let likedPostIdSet = new Set<string>();
    if (viewerUserId && posts.length > 0) {
      const postIds = posts.map((p: any) => p._id);
      const likes = await LikeModel.find({ userId: viewerUserId, postId: { $in: postIds } }).lean().exec();
      likes.forEach((l: any) => likedPostIdSet.add(l.postId.toString()));
    }

    const postsWithLiked = posts.map((p: any) => ({
      ...p,
      isLiked: likedPostIdSet.has(p._id.toString()),
    }));

    return { posts: postsWithLiked, total };
  }

  async update(id: string, text: string): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(id, { text }, { new: true }).populate("author", "username email").exec();
  }

  async delete(id: string): Promise<IPost | null> {
    const post = await PostModel.findByIdAndDelete(id).exec();
    if (post) {
      // Cascading clean-up of related likes & comments
      await CommentModel.deleteMany({ postId: id }).exec();
      await LikeModel.deleteMany({ postId: id }).exec();
    }
    return post;
  }
}
