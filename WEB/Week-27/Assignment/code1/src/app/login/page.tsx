"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await login(password);
      if (result.success) {
        router.push(from);
        router.refresh();
      } else {
        setError(result.error ?? "Login failed");
      }
    });
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter admin password"
            className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {pending ? "Logging in..." : "Login"}
        </button>
        <p className="text-xs text-slate-400 text-center">
          Hint: the password is your AUTH_SECRET from .env.local
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-slate-400">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
