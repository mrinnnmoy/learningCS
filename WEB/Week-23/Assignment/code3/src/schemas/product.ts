import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
