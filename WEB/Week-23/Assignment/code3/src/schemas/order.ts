import { z } from "zod";

export const OrderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const UpdateOrderStatusSchema = z.object({
  id: z.number().int().positive(),
  status: OrderStatusSchema,
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
