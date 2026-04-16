import { db } from "../lib/db";
import { Result, ok, err } from "../types";
import { decrementStock } from "./product";
import { eq } from "drizzle-orm";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { orders, orderItems, products } = require("../../drizzle/schema.js");

interface OrderItem {
  productId: number;
  quantity: number;
}

export interface OrderWithItems {
  id: number;
  userId: number;
  total: string;
  status: string;
  createdAt: Date;
  items: Array<{ name: string; price: string; quantity: number }>;
}

export const placeOrder = async (
  userId: number,
  items: OrderItem[],
): Promise<Result<OrderWithItems>> => {
  try {
    const lineItems: Array<{
      productId: number;
      name: string;
      price: string;
      quantity: number;
    }> = [];
    let total = 0;

    // Validate all items and build line items first
    for (const item of items) {
      const stockResult = await decrementStock(item.productId, item.quantity);
      if (!stockResult.success) return err(stockResult.error, stockResult.code);
      const product = stockResult.data;
      lineItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      total += parseFloat(product.price) * item.quantity;
    }

    // Create the order
    const [order] = await db
      .insert(orders)
      .values({ userId, total: total.toFixed(2), status: "PENDING" })
      .returning();

    // Insert all line items
    for (const li of lineItems) {
      await db.insert(orderItems).values({ orderId: order.id, ...li });
    }

    return ok({ ...order, items: lineItems } as OrderWithItems);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Order failed", 500);
  }
};
