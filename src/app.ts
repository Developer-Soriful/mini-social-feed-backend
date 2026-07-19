import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/routes/auth.routes";
import postRoutes from "./modules/post/routes/post.routes";
import likeRoutes from "./modules/like/routes/like.routes";
import commentRoutes from "./modules/comment/routes/comment.routes";
import userRoutes from "./modules/user/routes/user.routes";
import notificationRoutes from "./modules/notification/routes/notification.routes";
import { globalErrorHandler } from "./common/middlewares/error.middleware";

const app = express();

// Trust first proxy
app.set("trust proxy", 1);

// Security Headers 
app.use(helmet());


// CORS 
const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Body Parser 
app.use(express.json({ limit: "10kb" }));

//  Global Rate Limiter (all routes) 
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

//  Auth-specific Rate Limiter 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many login attempts, please try again after 15 minutes." },
});

//  Base Health Check 
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

//  Mounted Routes 
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", likeRoutes);
app.use("/api/posts", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

//  404 Handler 
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

//  Centralized Error Handler 
app.use(globalErrorHandler as (err: any, req: Request, res: Response, next: NextFunction) => void);

export default app;
