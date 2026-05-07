"use client";

import { useState, useEffect, useRef } from "react";

interface EventEntry {
  channel: string;
  payload?: Record<string, unknown>;
  receivedAt: string;
}

const CHANNEL_COLORS: Record<string, string> = {
  "order.placed": "border-l-blue-500 bg-blue-950/40",
  "payment.processed": "border-l-green-500 bg-green-950/40",
  "stock.updated": "border-l-yellow-500 bg-yellow-950/40",
  "notification.sent": "border-l-purple-500 bg-purple-950/40",
};

const CHANNEL_ICONS: Record<string, string> = {
  "order.placed": "📦",
  "payment.processed": "💳",
  "stock.updated": "🏭",
  "notification.sent": "🔔",
};

export default function EventBusDashboard() {
  const [userId, setUserId] = useState("1");
  const [total, setTotal] = useState("150.00");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Open SSE stream on mount
  useEffect(() => {
    const es = new EventSource("/api/events/stream");
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as EventEntry;
        setEvents((prev) => [data, ...prev].slice(0, 100)); // keep last 100
      } catch {
        /* ignore */
      }
    };

    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const handlePublish = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/events/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          total: parseFloat(total),
          items: [
            {
              productName: "Widget Pro",
              quantity: 2,
              price: parseFloat(total) / 2,
            },
          ],
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Bus Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Redis Pub/Sub — real-time domain events
          </p>
        </div>
        <div
          className={`flex items-center gap-2 text-sm ${connected ? "text-green-400" : "text-red-400"}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
          />
          {connected ? "SSE Connected" : "Disconnected"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Trigger form */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-4">
            🚀 Publish Order Event
          </h2>
          <form onSubmit={handlePublish} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">User ID</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Order Total ($)</label>
              <input
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-40 transition-colors"
            >
              {loading ? "Publishing..." : "Publish order.placed →"}
            </button>
          </form>

          {/* Channel legend */}
          <div className="mt-4 space-y-2">
            {Object.entries(CHANNEL_ICONS).map(([ch, icon]) => (
              <div
                key={ch}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <span>{icon}</span>
                <span className="font-mono">{ch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event count cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
          {Object.entries(CHANNEL_ICONS).map(([ch, icon]) => {
            const count = events.filter((e) => e.channel === ch).length;
            return (
              <div
                key={ch}
                className="bg-slate-900 rounded-xl border border-slate-800 p-4"
              >
                <p className="text-2xl">{icon}</p>
                <p className="font-mono text-xs text-slate-400 mt-1">{ch}</p>
                <p className="text-2xl font-bold text-white mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live event feed */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-300">
            📡 Live Event Feed
            {events.length > 0 && (
              <span className="ml-2 text-xs text-slate-500">
                {events.length} events
              </span>
            )}
          </h2>
          <button
            onClick={() => setEvents([])}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">
              Publish an event above to see it flow through the system...
            </p>
          ) : (
            events.map((ev, i) => (
              <div
                key={i}
                className={`border-l-4 rounded-r-lg px-4 py-3 ${CHANNEL_COLORS[ev.channel] ?? "border-l-slate-600 bg-slate-800/40"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{CHANNEL_ICONS[ev.channel] ?? "📨"}</span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {ev.channel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(ev.receivedAt).toLocaleTimeString()}
                  </span>
                </div>
                {ev.payload && (
                  <pre className="text-xs text-slate-400 mt-1 overflow-x-auto">
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
