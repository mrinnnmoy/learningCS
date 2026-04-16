import { db } from "../lib/db";
import { Result, ok, err } from "../types";
import { eq, sql } from "drizzle-orm";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { products } = require("../../drizzle/schema.js");

export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  stock: number;
  createdAt: Date;
}

export const getProducts = async (
  category?: string,
): Promise<Result<Product[]>> => {
  try {
    const rows = await db
      .select()
      .from(products)
      .where(category ? eq(products.category, category) : undefined);
    return ok(rows as Product[]);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Query failed", 500);
  }
};

export const decrementStock = async (
  id: number,
  quantity: number,
): Promise<Result<Product>> => {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!product) return err(`Product ${id} not found`, 404);
    if (product.stock < quantity) {
      return err(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        400,
      );
    }
    const [updated] = await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${quantity}` })
      .where(eq(products.id, id))
      .returning();
    return ok(updated as Product);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Stock update failed", 500);
  }
};
