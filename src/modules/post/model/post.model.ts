import { Schema, model } from "mongoose";
import { IPost } from "../types/post.types";

const postSchema = new Schema<IPost>(
  {
    text: {
      type: String,
      required: [true, "Post content text is required"],
      trim: true,
      maxlength: [500, "Post text cannot exceed 500 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post author is required"],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index to support fetching newest posts first
postSchema.index({ createdAt: -1 });

export const PostModel = model<IPost>("Post", postSchema);
