import { Router, Request, Response, NextFunction } from "express";
import { getDashboard } from "../models/dashboard";

const router = Router();

router.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await getDashboard();
      if (!result.success) {
        res.status(result.code).json({ success: false, message: result.error });
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
