"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const inp =
  "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.user.login.useMutation({
    onSuccess: () => {
      // Invalidate user.me so the dashboard refetches with the new session
      utils.user.me.invalidate();
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4"
      >
        {registered && (
          <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
            Account created — you can now sign in.
          </p>
        )}
        {login.error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {login.error.message}
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inp}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inp}
        />
        <button
          type="submit"
          disabled={login.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {login.isPending ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-center text-xs text-slate-400">
          No account?{" "}
          <a href="/register" className="text-blue-500">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
