import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: (result.error as ZodError).errors.map((e) => ({
          field: e.path.join(".") || "body",
          message: e.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
