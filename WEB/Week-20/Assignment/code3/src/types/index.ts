export interface User {
  id: number;
  name: string;
  email: string;
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface OrderStats {
  totalRevenue: number;
  pendingCount: number;
  deliveredCount: number;
  orderCount: number;
}
