import { Schema, model, Types } from "mongoose";

export interface ILike {
  _id?: Types.ObjectId;
  userId: Types.ObjectId | any;
  postId: Types.ObjectId | any;
  createdAt?: Date;
}


const likeSchema = new Schema<ILike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LikeModel = model<ILike>("Like", likeSchema);
