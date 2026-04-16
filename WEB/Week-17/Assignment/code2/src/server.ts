import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import { AppError } from "./errors/AppError";
import "./types";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("FATAL: JWT_SECRET must be set and at least 32 characters");
}

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Week 17 — Assignment 2: Typed Auth + Posts API" });
});

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ success: false, message: "Already exists" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
  }
  console.error(err);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

app.use(errorHandler);

const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
