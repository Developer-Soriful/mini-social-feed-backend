import { Types } from "mongoose";

export interface IPost {
  _id?: Types.ObjectId;
  text: string;
  author: Types.ObjectId | any;
  likesCount: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePostInput {
  text: string;
  author: string;
}

