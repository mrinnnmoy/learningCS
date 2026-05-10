import { Badge, Card, Button } from "@acme/ui";
import { formatCurrency, formatDate } from "@acme/utils";
import type { Order, OrderStatus } from "@acme/types";

// Mock orders — uses the SAME Order type as apps/web
const mockOrders: Order[] = [
  {
    id: 1001,
    userId: 1,
    items: [
      {
        productId: 1,
        productName: "Wireless Headphones",
        quantity: 1,
        price: 299.99,
      },
    ],
    total: 299.99,
    status: "delivered",
    createdAt: "2025-06-01T10:00:00Z",
  },
  {
    id: 1002,
    userId: 2,
    items: [
      {
        productId: 2,
        productName: "Mechanical Keyboard",
        quantity: 2,
        price: 149.99,
      },
    ],
    total: 299.98,
    status: "processing",
    createdAt: "2025-06-10T14:30:00Z",
  },
  {
    id: 1003,
    userId: 3,
    items: [
      {
        productId: 3,
        productName: "Ergonomic Mouse",
        quantity: 1,
        price: 89.99,
      },
    ],
    total: 89.99,
    status: "pending",
    createdAt: "2025-06-11T09:15:00Z",
  },
];

const statusVariant: Record<
  OrderStatus,
  "success" | "info" | "warning" | "danger" | "default"
> = {
  delivered: "success",
  shipped: "info",
  processing: "warning",
  pending: "default",
  cancelled: "danger",
};

export default function AdminDashboard() {
  const totalRevenue = mockOrders.reduce((s, o) => s + o.total, 0);
  const pending = mockOrders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Orders", value: mockOrders.length.toString() },
          { label: "Total Revenue", value: formatCurrency(totalRevenue) },
          { label: "Pending Orders", value: pending.toString() },
        ].map((stat) => (
          <Card key={stat.label} className="!bg-slate-900 !border-slate-800">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Orders table */}
      <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
      <div className="flex flex-col gap-3">
        {mockOrders.map((order) => (
          <Card key={order.id} className="!bg-slate-900 !border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Order #{order.id}</p>
                <p className="text-xs text-slate-400">
                  {order.items.map((i) => i.productName).join(", ")} ·{" "}
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  label={order.status}
                  variant={statusVariant[order.status]}
                />
                <p className="font-bold text-white">
                  {formatCurrency(order.total)}
                </p>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
