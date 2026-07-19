import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log full error server-side for observability
  console.error("[GlobalErrorHandler]", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  // Zod Validation Errors 
  if (err instanceof ZodError) {
    res.status(400).json({
      status: "fail",
      errors: err.errors.map((e) => ({
        field: e.path.slice(1).join("."),
        message: e.message,
      })),
    });
    return;
  }

  // JWT Errors 
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(401).json({
      status: "fail",
      message: "Not authorized. Please log in again.",
    });
    return;
  }

  // Mongoose Duplicate Key 
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      status: "fail",
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
    return;
  }

  // Mongoose Validation Error 
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e: any) => e.message);
    res.status(400).json({
      status: "fail",
      message: messages.join(", "),
    });
    return;
  }

  // Mongoose Cast Error (invalid ObjectId) 
  if (err.name === "CastError") {
    res.status(400).json({
      status: "fail",
      message: "Invalid ID format.",
    });
    return;
  }

  // Known application errors (thrown from services with a status) 
  const statusCode = typeof err.status === "number" ? err.status : 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  res.status(statusCode).json({
    status: isClientError ? "fail" : "error",
    message: isClientError ? err.message : "An unexpected error occurred. Please try again.",
  });
};
