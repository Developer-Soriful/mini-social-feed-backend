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

  async registerFcmToken(userId: string, fcmToken: string): Promise<IUser | null> {
    // Clean up duplicate token associations from other accounts on this device
    await UserModel.updateMany(
      { fcmToken, _id: { $ne: userId } },
      { $set: { fcmToken: "" } }
    ).exec();
    return UserModel.findByIdAndUpdate(userId, { fcmToken }, { new: true }).exec();
  }

  async updateProfile(
    userId: string,
    fields: { username?: string; bio?: string; headline?: string }
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: fields },
      { new: true, runValidators: true }
    ).exec();
  }

  async isUsernameTaken(username: string, excludeUserId: string): Promise<boolean> {
    const user = await UserModel.findOne({ username, _id: { $ne: excludeUserId } }).lean().exec();
    return !!user;
  }
}
