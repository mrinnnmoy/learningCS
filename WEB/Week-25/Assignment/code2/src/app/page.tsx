"use client";

import { useState, useEffect, useRef } from "react";

interface OrderEvent {
  queue?: string;
  event: string;
  jobId?: string;
  progress?: number;
  result?: unknown;
  reason?: string;
  message?: string;
  orderId?: number;
  at: string;
}

export default function OrderPipelinePage() {
  const [userId, setUserId] = useState("1");
  const [total, setTotal] = useState("750");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [priority, setPriority] = useState<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Clean up SSE on unmount
  useEffect(() => () => esRef.current?.close(), []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setEvents([]);
    setOrderId(null);
    esRef.current?.close();

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          total: parseFloat(total),
          items: [
            {
              productName: "Laptop Pro",
              quantity: 1,
              price: parseFloat(total),
            },
          ],
        }),
      });
      const data = (await res.json()) as { orderId: number; priority: number };
      setOrderId(data.orderId);
      setPriority(data.priority);

      // Open SSE connection for live job updates
      const es = new EventSource(`/api/orders/${data.orderId}/status`);
      esRef.current = es;

      es.onmessage = (event) => {
        const parsed = JSON.parse(event.data) as OrderEvent;
        setEvents((prev) => [
          ...prev,
          { ...parsed, at: new Date().toLocaleTimeString() },
        ]);
      };

      es.onerror = () => {
        es.close();
      };
    } catch {
      setEvents([
        {
          event: "error",
          message: "Failed to create order",
          at: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const eventColor = (e: OrderEvent): string => {
    if (e.event === "completed") return "text-green-400";
    if (e.event === "failed") return "text-red-400";
    if (e.event === "progress") return "text-blue-400";
    return "text-slate-400";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">
        Order Processing Pipeline
      </h1>
      <p className="text-slate-400 mb-8">
        Fan-out queues • Priority • DLQ • Live SSE progress
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order form */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-4">
            📦 Place an Order
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">User ID</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className={inp}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">
                Total Amount
                <span className="ml-2 text-xs">
                  {parseFloat(total) > 500 ? (
                    <span className="text-yellow-400">
                      ⚡ High Priority (p1)
                    </span>
                  ) : (
                    <span className="text-slate-500">Normal Priority (p5)</span>
                  )}
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
                className={inp}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-40 transition-colors"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          {orderId && (
            <div className="mt-4 bg-slate-800 rounded-lg p-3 text-sm">
              <p className="text-slate-300">
                Order ID:{" "}
                <span className="text-white font-bold">#{orderId}</span>
              </p>
              <p className="text-slate-300">
                Priority:{" "}
                <span className="text-yellow-400">
                  {priority === 1 ? "⚡ High (1)" : "Normal (5)"}
                </span>
              </p>
              <p className="text-green-400 text-xs mt-1">
                ✅ Enqueued — watching live events below...
              </p>
            </div>
          )}
        </div>

        {/* Live SSE events */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-4">
            📡 Live Job Events
            {events.length > 0 && (
              <span className="ml-2 text-xs text-slate-500">(SSE)</span>
            )}
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-slate-600 text-sm">
                Place an order to see real-time job events...
              </p>
            ) : (
              events.map((ev, i) => (
                <div key={i} className={`text-xs font-mono ${eventColor(ev)}`}>
                  <span className="text-slate-600">{ev.at} </span>
                  {ev.queue && (
                    <span className="text-slate-500">[{ev.queue}] </span>
                  )}
                  <span className="font-medium">{ev.event}</span>
                  {ev.progress !== undefined && <span> — {ev.progress}%</span>}
                  {ev.reason && (
                    <span className="text-red-400"> — {ev.reason}</span>
                  )}
                  {ev.message && <span> — {ev.message}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pipeline explanation */}
      <div className="mt-6 bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="font-semibold text-slate-300 mb-3">⚙️ Pipeline Flow</h2>
        <div className="text-sm text-slate-400 space-y-1">
          <p>
            1. <span className="text-blue-400">POST /api/orders</span> creates
            an order in SQLite and fans out to 3 queues.
          </p>
          <p>
            2. <span className="text-purple-400">Inventory worker</span>{" "}
            decrements stock (child job — runs first).
          </p>
          <p>
            3. <span className="text-green-400">Payment worker</span> charges
            the card (parent job — runs after inventory).
          </p>
          <p>
            4. <span className="text-yellow-400">Receipt worker</span> generates
            PDF and sends email (independent — runs in parallel).
          </p>
          <p>
            5. If payment fails all 3 retries →{" "}
            <span className="text-red-400">DLQ worker</span> receives and alerts
            the team.
          </p>
          <p>
            6. <span className="text-slate-300">Heartbeat</span> runs every
            minute and logs pending order count.
          </p>
        </div>
      </div>
    </div>
  );
}
