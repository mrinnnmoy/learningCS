import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import orderRoutes from "./routes/orders";
import dashboardRoutes from "./routes/dashboard";
import { AppError } from "./errors/AppError";
import { isAppError } from "./types";
import { env } from "./config/env";

const app = express();
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message:
      "Week 17 — Assignment 3: Generics, Result Type, Drizzle + TypeScript",
    routes: ["POST /api/orders", "GET /api/dashboard"],
  });
});

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (isAppError(err)) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};

app.use(errorHandler);
app.listen(env.PORT, () => console.log(`🚀 http://localhost:${env.PORT}`));
