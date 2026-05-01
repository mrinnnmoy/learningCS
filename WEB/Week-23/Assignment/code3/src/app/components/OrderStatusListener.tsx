"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { OrderStatus } from "@/schemas/order";

interface Props {
  orderId: number;
  currentStatus: string;
}

export default function OrderStatusListener({ orderId, currentStatus }: Props) {
  const [liveStatus, setLiveStatus] = useState<string>(currentStatus);
  const [events, setEvents] = useState<string[]>([]);

  trpc.order.onStatusChange.useSubscription(
    { orderId },
    {
      onData: (data) => {
        setLiveStatus(data.status);
        setEvents((prev) => [
          `Order #${data.orderId} → ${data.status}`,
          ...prev.slice(0, 4),
        ]);
      },
      onError: (err) => console.error("Subscription error:", err),
    },
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[liveStatus] ?? "bg-slate-100 text-slate-600"}`}
      >
        {liveStatus} {liveStatus !== currentStatus && "(live)"}
      </span>
      {events.length > 0 && (
        <ul className="mt-2 text-xs text-slate-400 space-y-1">
          {events.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
