import { Types } from "mongoose";

export interface INotification {
  _id?: Types.ObjectId;
  recipient: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  type: "like" | "comment";
  post: Types.ObjectId | string;
  isRead: boolean;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}
