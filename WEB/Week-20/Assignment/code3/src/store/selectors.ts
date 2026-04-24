import { selector } from "recoil";
import { ordersAtom, statusFilterAtom, searchAtom } from "./atoms";
import { Order, OrderStats } from "../types";

export const orderStatsSelector = selector<OrderStats>({
  key: "orderStatsSelector",
  get: ({ get }) => {
    const orders = get(ordersAtom);
    return {
      totalRevenue: orders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + o.total, 0),
      pendingCount: orders.filter((o) => o.status === "pending").length,
      deliveredCount: orders.filter((o) => o.status === "delivered").length,
      orderCount: orders.length,
    };
  },
});

export const filteredOrdersSelector = selector<Order[]>({
  key: "filteredOrdersSelector",
  get: ({ get }) => {
    const orders = get(ordersAtom);
    const status = get(statusFilterAtom);
    const search = get(searchAtom).toLowerCase();
    return orders.filter((o) => {
      const matchStatus = status === "all" || o.status === status;
      const matchSearch =
        !search ||
        o.customer.toLowerCase().includes(search) ||
        o.id.toLowerCase().includes(search);
      return matchStatus && matchSearch;
    });
  },
});
