import { Schema, model, Types } from "mongoose";

export interface IComment {
  _id?: Types.ObjectId;
  userId: Types.ObjectId | any;
  postId: Types.ObjectId | any;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const commentSchema = new Schema<IComment>(
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
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [280, "Comment cannot exceed 280 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export const CommentModel = model<IComment>("Comment", commentSchema);
