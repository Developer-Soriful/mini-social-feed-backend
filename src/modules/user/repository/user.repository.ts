import { UserModel } from "../model/user.model";
import { IUser } from "../types/user.types";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return UserModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return UserModel.create(userData);
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(userId, { fcmToken }, { new: true }).exec();
  }
}
