import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-5xl font-bold text-slate-900">
        Welcome to <span className="text-blue-500">NextBlog</span>
      </h1>
      <p className="text-lg text-slate-500 max-w-md">
        A full-stack blog built with Next.js 14, Server Actions, Prisma, and
        SQLite.
      </p>
      <Link
        href="/blog"
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Read the Blog
      </Link>
    </div>
  );
}
