import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import bookRoutes from "./routes/books";
import { AppError } from "./errors/AppError";

const app = express();
app.use(express.json());
app.use("/api/books", bookRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Week 17 — Assignment 1: Type-Safe Books API" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
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
  console.error("Unexpected error:", err);
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
