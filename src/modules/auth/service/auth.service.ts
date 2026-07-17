import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repository/user.repository";
import { SignupInput, LoginInput, AuthResponse } from "../types/auth.types";

const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkeychangeinproduction12345";
const userRepository = new UserRepository();

export class AuthService {
  async signup(input: SignupInput): Promise<AuthResponse> {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      fcmToken: input.fcmToken || "",
    });

    const token = jwt.sign(
      { userId: user._id!.toString(), username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        fcmToken: user.fcmToken,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    if (input.fcmToken && user.fcmToken !== input.fcmToken) {
      await userRepository.updateFcmToken(user._id!.toString(), input.fcmToken);
      user.fcmToken = input.fcmToken;
    }

    const token = jwt.sign(
      { userId: user._id!.toString(), username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        fcmToken: user.fcmToken,
      },
    };
  }
}
