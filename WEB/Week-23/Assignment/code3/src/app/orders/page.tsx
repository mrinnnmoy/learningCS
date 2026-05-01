"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import OrderStatusListener from "@/app/components/OrderStatusListener";

export default function OrdersPage() {
  const {
    data: orders,
    isLoading,
    error,
  } = trpc.order.getMyOrders.useQuery(undefined, {
    retry: false,
  });

  if (isLoading) return <p className="text-slate-400">Loading orders...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Orders</h1>
      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
          <p>No orders yet.</p>
          <Link
            href="/"
            className="text-blue-500 hover:underline text-sm mt-2 block"
          >
            Shop now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    ${order.total.toFixed(2)}
                  </p>
                  {/* Real-time status listener — updates via SSE subscription */}
                  <OrderStatusListener
                    orderId={order.id}
                    currentStatus={order.status}
                  />
                </div>
              </div>
              <ul className="text-sm text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
