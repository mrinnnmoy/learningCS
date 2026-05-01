"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const inp =
  "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = trpc.user.register.useMutation({
    onSuccess: () => router.push("/login?registered=true"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    register.mutate({ name, email, password });
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Account</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4"
      >
        {register.error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {register.error.message}
          </p>
        )}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inp}
        />
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
          disabled={register.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {register.isPending ? "Creating..." : "Create Account"}
        </button>
        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
