import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./modules/auth/routes/auth.routes";
import postRoutes from "./modules/post/routes/post.routes";
import likeRoutes from "./modules/like/routes/like.routes";
import commentRoutes from "./modules/comment/routes/comment.routes";
import userRoutes from "./modules/user/routes/user.routes";
import notificationRoutes from "./modules/notification/routes/notification.routes";

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());

// Base health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

// Mounted Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", likeRoutes);
app.use("/api/posts", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandle global error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
