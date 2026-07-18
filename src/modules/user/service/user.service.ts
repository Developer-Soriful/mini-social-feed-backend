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

  async updateProfile(
    userId: string,
    fields: { username?: string; bio?: string; headline?: string }
  ): Promise<Omit<IUser, "password">> {
    // Guard: username conflict check before writing
    if (fields.username) {
      const taken = await userRepository.isUsernameTaken(fields.username, userId);
      if (taken) {
        throw new Error("Username is already taken. Please choose another.");
      }
    }

    const updated = await userRepository.updateProfile(userId, fields);
    if (!updated) {
      throw new Error("User not found");
    }

    const userObj = (updated as any).toObject ? (updated as any).toObject() : updated;
    const { password, ...profile } = userObj;
    if (userObj._id) {
      profile.id = userObj._id.toString();
    }
    return profile;
  }
}
