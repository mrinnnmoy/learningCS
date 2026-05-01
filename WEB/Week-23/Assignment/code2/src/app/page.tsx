"use client";

import { trpc } from "@/lib/trpc/client";

export default function HomePage() {
  const { data: posts, isLoading, error } = trpc.post.getAll.useQuery();

  if (isLoading) return <p className="text-slate-400">Loading posts...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Blog Posts</h1>
      {!posts || posts.length === 0 ? (
        <p className="text-slate-400">No published posts yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {post.title}
              </h2>
              <p className="text-slate-500 text-sm mt-1 line-clamp-3">
                {post.content}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                by {post.author.name} ·{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
