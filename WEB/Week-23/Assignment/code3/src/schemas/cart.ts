import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

export const UpdateCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(0), // 0 means remove
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartInput = z.infer<typeof UpdateCartItemSchema>;
