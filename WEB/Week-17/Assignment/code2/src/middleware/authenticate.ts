import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }
  try {
    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as JwtPayload;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
