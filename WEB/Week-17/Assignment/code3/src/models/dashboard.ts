import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { Result, ok, err } from "../types";

export interface DashboardData {
  revenueByMonth: Array<{ month: number; revenue: string; orders: number }>;
  topProducts: Array<{
    name: string;
    total_sold: number;
    total_revenue: string;
  }>;
  ordersByStatus: Array<{ status: string; count: number }>;
}

export const getDashboard = async (): Promise<Result<DashboardData>> => {
  try {
    const [revenueRows, topRows, statusRows] = await Promise.all([
      db.execute(sql`
        SELECT EXTRACT(MONTH FROM created_at)::int AS month,
               SUM(total)::text                    AS revenue,
               COUNT(*)::int                       AS orders
        FROM orders WHERE status = 'DELIVERED'
          AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
        GROUP BY month ORDER BY month
      `),
      db.execute(sql`
        SELECT oi.name,
               SUM(oi.quantity)::int                            AS total_sold,
               SUM(oi.quantity * oi.price::numeric)::text       AS total_revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'DELIVERED'
        GROUP BY oi.name ORDER BY total_sold DESC LIMIT 5
      `),
      db.execute(sql`
        SELECT status, COUNT(*)::int AS count
        FROM orders GROUP BY status ORDER BY count DESC
      `),
    ]);

    return ok({
      revenueByMonth: revenueRows.rows as DashboardData["revenueByMonth"],
      topProducts: topRows.rows as DashboardData["topProducts"],
      ordersByStatus: statusRows.rows as DashboardData["ordersByStatus"],
    });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Dashboard query failed", 500);
  }
};
