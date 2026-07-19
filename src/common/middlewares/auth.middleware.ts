import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

// JWT_SECRET is validated at startup (server.ts) — no fallback here
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ status: "fail", message: "Not authorized, token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    // Let the global error handler classify JsonWebTokenError / TokenExpiredError
    next(error);
  }
};
