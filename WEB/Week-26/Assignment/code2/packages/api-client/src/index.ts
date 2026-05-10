import type { Product, User, Order, OrderItem } from "@acme/types";

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/api/products");
  }

  getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  getUsers(): Promise<User[]> {
    return this.request<User[]>("/api/users");
  }

  createOrder(data: {
    userId: number;
    items: Omit<OrderItem, "productName">[];
  }): Promise<Order> {
    return this.request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}

// Re-export all types so consumers only need to import from @acme/api-client
export type { Product, User, Order, OrderItem, OrderStatus } from "@acme/types";
