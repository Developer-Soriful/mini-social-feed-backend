import mongoose from "mongoose";
import { PostModel } from "../model/post.model";
import { UserModel } from "../../user/model/user.model";
import { CommentModel } from "../../comment/model/comment.model";
import { LikeModel } from "../../like/model/like.model";
import { IPost, CreatePostInput } from "../types/post.types";

// Author fields safe to expose to clients — fcmToken is intentionally excluded
const AUTHOR_PUBLIC_FIELDS = "username email headline";

export class PostRepository {
  async create(input: CreatePostInput): Promise<IPost> {
    return PostModel.create(input);
  }

  async findById(id: string, viewerUserId?: string): Promise<(IPost & { isLiked: boolean }) | null> {
    const post = await PostModel.findById(id)
      .populate("author", AUTHOR_PUBLIC_FIELDS)
      .lean()
      .exec();
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

  async decrementComments(postId: string): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: -1 } },
      { new: true }
    ).exec();
  }

  async findAllPaginated(
    page: number,
    limit: number,
    username?: string,
    viewerUserId?: string,
    strict?: boolean
  ): Promise<{ posts: (IPost & { isLiked: boolean })[]; total: number }> {
    const skip = (page - 1) * limit;

    let posts: any[] = [];
    let total = 0;

    if (username && strict) {
      // Strict mode: only posts by exactly-matched username(s), fully in DB
      const matchedUsers = await UserModel.find({
        username: { $regex: new RegExp(username, "i") },
      })
        .select("_id")
        .exec();
      const matchedUserIds = matchedUsers.map((u) => u._id);

      total = await PostModel.countDocuments({ author: { $in: matchedUserIds } }).exec();
      posts = await PostModel.find({ author: { $in: matchedUserIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_PUBLIC_FIELDS)
        .lean()
        .exec();
    } else if (username && !strict) {
      // Fuzzy mode: matched author posts first, then rest — done entirely in MongoDB
      // via aggregation to avoid in-memory full-collection sort
      const matchedUsers = await UserModel.find({
        username: { $regex: new RegExp(username, "i") },
      })
        .select("_id")
        .exec();
      const matchedUserIds = matchedUsers.map((u) => new mongoose.Types.ObjectId(u._id.toString()));

      const pipeline: any[] = [
        {
          $addFields: {
            _sortPriority: {
              $cond: [{ $in: ["$author", matchedUserIds] }, 0, 1],
            },
          },
        },
        { $sort: { _sortPriority: 1, createdAt: -1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: "users",
                  localField: "author",
                  foreignField: "_id",
                  as: "author",
                  pipeline: [
                    {
                      $project: {
                        username: 1,
                        email: 1,
                        headline: 1,
                      },
                    },
                  ],
                },
              },
              { $unwind: { path: "$author", preserveNullAndEmpty: false } },
            ],
          },
        },
      ];

      const [result] = await PostModel.aggregate(pipeline).exec();
      total = result.metadata[0]?.total ?? 0;
      posts = result.data;
    } else {
      // No filter — standard paginated feed
      total = await PostModel.countDocuments({}).exec();
      posts = await PostModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_PUBLIC_FIELDS)
        .lean()
        .exec();
    }

    // Batch-fetch which of these posts the viewer has liked in ONE query
    let likedPostIdSet = new Set<string>();
    if (viewerUserId && posts.length > 0) {
      const postIds = posts.map((p: any) => p._id);
      const likes = await LikeModel.find({ userId: viewerUserId, postId: { $in: postIds } })
        .lean()
        .exec();
      likes.forEach((l: any) => likedPostIdSet.add(l.postId.toString()));
    }

    const postsWithLiked = posts.map((p: any) => ({
      ...p,
      isLiked: likedPostIdSet.has(p._id.toString()),
    }));

    return { posts: postsWithLiked, total };
  }

  async update(id: string, text: string): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(id, { text }, { new: true })
      .populate("author", AUTHOR_PUBLIC_FIELDS)
      .exec();
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
