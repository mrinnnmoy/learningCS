"use client";

import { useState, useEffect, useCallback } from "react";

interface QueueCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}
interface QueueStatus {
  email: QueueCounts;
  notification: QueueCounts;
  fetchedAt: string;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 border ${color}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QueuePanel({
  title,
  counts,
  icon,
}: {
  title: string;
  counts: QueueCounts;
  icon: string;
}) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <h2 className="font-semibold text-slate-300 mb-4">
        {icon} {title} Queue
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          label="Waiting"
          value={counts.waiting}
          color="border-slate-700 text-slate-200"
        />
        <StatCard
          label="Active"
          value={counts.active}
          color="border-blue-800 text-blue-300"
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          color="border-green-800 text-green-300"
        />
        <StatCard
          label="Failed"
          value={counts.failed}
          color="border-red-800 text-red-300"
        />
        <StatCard
          label="Delayed"
          value={counts.delayed}
          color="border-yellow-800 text-yellow-300"
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/queue-status");
      const data = (await res.json()) as QueueStatus;
      setStatus(data);
    } catch {
      /* ignore */
    }
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = (await res.json()) as { message: string };
      setMessage(data.message);
      setName("");
      setEmail("");
      setTimeout(fetchStatus, 500); // refresh stats shortly after
    } catch {
      setMessage("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Queue Dashboard</h1>
        <p className="text-slate-400 mt-1">
          BullMQ + Redis background job queues
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Registration form */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-4">
            👤 Register a User
          </h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inp}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inp}
            />
            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-40 transition-colors"
            >
              {loading ? "Registering..." : "Register & Enqueue Jobs"}
            </button>
            {message && (
              <p className="text-green-400 text-sm text-center">{message}</p>
            )}
          </form>
        </div>

        {/* How it works */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-3">⚙️ How it works</h2>
          <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
            <li>
              Form submits →{" "}
              <code className="text-blue-400">POST /api/register</code> runs.
            </li>
            <li>
              API saves the user and calls{" "}
              <code className="text-blue-400">emailQueue.add()</code> and{" "}
              <code className="text-blue-400">notificationQueue.add()</code>.
            </li>
            <li>
              API returns{" "}
              <strong className="text-white">201 immediately</strong> — it does
              NOT wait for jobs to run.
            </li>
            <li>
              The <strong className="text-white">email worker</strong> (separate
              process) picks up the job, simulates sending, and updates
              progress.
            </li>
            <li>
              The <strong className="text-white">notification worker</strong>{" "}
              picks up its job and logs the notification.
            </li>
            <li>
              This page polls{" "}
              <code className="text-blue-400">GET /api/queue-status</code> every
              5s to show live counts.
            </li>
          </ol>
        </div>
      </div>

      {/* Queue stats */}
      {status ? (
        <div className="flex flex-col gap-4">
          <QueuePanel title="Email" counts={status.email} icon="📧" />
          <QueuePanel
            title="Notification"
            counts={status.notification}
            icon="🔔"
          />
          <p className="text-xs text-slate-600 text-right">
            Last updated: {new Date(status.fetchedAt).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center text-slate-500">
          Loading queue stats...
        </div>
      )}
    </div>
  );
}
