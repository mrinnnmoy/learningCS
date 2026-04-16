import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { placeOrder } from "../models/order";

const router = Router();

const OrderSchema = z.object({
  userId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z
          .number()
          .int()
          .positive("Quantity must be a positive integer"),
      }),
    )
    .min(1, "At least one item is required"),
});

type OrderDto = z.infer<typeof OrderSchema>;

router.post(
  "/",
  validate(OrderSchema),
  async (
    req: Request<{}, {}, OrderDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await placeOrder(req.body.userId, req.body.items);
      if (!result.success) {
        res.status(result.code).json({ success: false, message: result.error });
        return;
      }
      res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
