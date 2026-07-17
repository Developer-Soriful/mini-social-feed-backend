import { LikeModel, ILike } from "../model/like.model";

export class LikeRepository {
  async exists(userId: string, postId: string): Promise<boolean> {
    const count = await LikeModel.countDocuments({ userId, postId }).exec();
    return count > 0;
  }

  async create(userId: string, postId: string): Promise<ILike> {
    return LikeModel.create({ userId, postId });
  }

  async delete(userId: string, postId: string): Promise<any> {
    return LikeModel.deleteOne({ userId, postId }).exec();
  }
}
