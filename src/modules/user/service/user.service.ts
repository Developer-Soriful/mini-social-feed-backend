import { UserRepository } from "../repository/user.repository";
import { IUser } from "../types/user.types";

const userRepository = new UserRepository();

export class UserService {
  async getProfile(userId: string): Promise<Omit<IUser, "password">> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...profile } = userObj;
    
    // Format id cleanly
    if (userObj._id) {
      profile.id = userObj._id.toString();
    }
    
    return profile;
  }
}
