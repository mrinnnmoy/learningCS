"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerUser } from "@/app/actions/authActions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
    >
      {pending ? "Creating account..." : "Create Account"}
    </button>
  );
}

const inp =
  "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, null);

  return (
    <div className="flex justify-center py-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Create an account
        </h1>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Name
            <input
              name="name"
              type="text"
              required
              placeholder="Alice Johnson"
              className={inp}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="alice@example.com"
              className={inp}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Password
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className={inp}
            />
          </label>
          <SubmitButton />
        </form>
        <p className="text-sm text-center text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
