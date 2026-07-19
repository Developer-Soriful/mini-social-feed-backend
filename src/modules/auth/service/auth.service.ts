import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repository/user.repository";
import { SignupInput, LoginInput, AuthResponse } from "../types/auth.types";

// JWT_SECRET is validated at startup (server.ts) 
const jwtSecret = process.env.JWT_SECRET!;
const userRepository = new UserRepository();

export class AuthService {
  async signup(input: SignupInput): Promise<AuthResponse> {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      const err: any = new Error("Email already registered");
      err.status = 409;
      throw err;
    }

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) {
      const err: any = new Error("Username already taken");
      err.status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      fcmToken: "",
    });

    if (input.fcmToken) {
      await userRepository.registerFcmToken(user._id!.toString(), input.fcmToken);
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

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      const err: any = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      const err: any = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    if (input.fcmToken) {
      await userRepository.registerFcmToken(user._id!.toString(), input.fcmToken);
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
