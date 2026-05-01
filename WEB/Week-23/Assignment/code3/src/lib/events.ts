import { EventEmitter } from "events";
import type { OrderStatus } from "@/schemas/order";

interface OrderStatusChangedEvent {
  orderId: number;
  userId: number;
  status: OrderStatus;
}

// Typed EventEmitter for order status changes
// In production, replace this with Redis pub/sub for multi-instance deployments
class OrderEventEmitter extends EventEmitter {
  emitStatusChange(data: OrderStatusChangedEvent): void {
    this.emit("statusChange", data);
  }

  onStatusChange(
    listener: (data: OrderStatusChangedEvent) => void,
  ): () => void {
    this.on("statusChange", listener);
    return () => this.off("statusChange", listener);
  }
}

// Singleton — persists across requests in the same process
const globalForEvents = globalThis as unknown as {
  orderEvents?: OrderEventEmitter;
};
export const orderEvents =
  globalForEvents.orderEvents ?? new OrderEventEmitter();
if (process.env.NODE_ENV !== "production")
  globalForEvents.orderEvents = orderEvents;
