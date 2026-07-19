import { CommentModel, IComment } from "../model/comment.model";

export class CommentRepository {
  async create(userId: string, postId: string, text: string): Promise<IComment> {
    return CommentModel.create({ userId, postId, text });
  }

  async findByPostId(postId: string): Promise<IComment[]> {
    return CommentModel.find({ postId })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .exec();
  }
  async deleteByPostId(postId: string): Promise<number> {
    const result = await CommentModel.deleteMany({ postId }).exec();
    return result.deletedCount ?? 0;
  }
}
