import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-5xl font-bold text-slate-900">
        Welcome to <span className="text-blue-500">NextStore</span>
      </h1>
      <p className="text-lg text-slate-500 max-w-md">
        A full-stack e-commerce store built with Next.js 14, NextAuth, Prisma,
        and Server Actions.
      </p>
      <div className="flex gap-4">
        <Link
          href="/products"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Shop Now
        </Link>
        <Link
          href="/register"
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
