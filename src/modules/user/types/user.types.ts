import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  headline?: string;
  fcmToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

