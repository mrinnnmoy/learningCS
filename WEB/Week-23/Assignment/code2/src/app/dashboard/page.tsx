"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export default function DashboardPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery(
    undefined,
    {
      retry: false, // Don't retry UNAUTHORIZED errors — just show the message
    },
  );

  const { data: myPosts, isLoading: postsLoading } =
    trpc.post.getMyPosts.useQuery(undefined, {
      enabled: !!user, // Only fetch posts if we know the user is logged in
    });

  const logout = trpc.user.logout.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      router.push("/");
    },
  });

  const togglePublish = trpc.post.togglePublish.useMutation({
    onSuccess: () => utils.post.getMyPosts.invalidate(),
  });

  const deletePost = trpc.post.delete.useMutation({
    onSuccess: () => utils.post.getMyPosts.invalidate(),
  });

  if (userLoading) return <p className="text-slate-400">Loading...</p>;

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">
          You must be logged in to view the dashboard.
        </p>
        <a
          href="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Welcome back, {user.name}
          </p>
        </div>
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {logout.isPending ? "Signing out..." : "Sign out"}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">My Posts</h2>
        <a
          href="/posts/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          + New Post
        </a>
      </div>

      {postsLoading ? (
        <p className="text-slate-400 text-sm">Loading posts...</p>
      ) : !myPosts || myPosts.length === 0 ? (
        <p className="text-slate-400 text-sm">
          No posts yet.{" "}
          <a href="/posts/new" className="text-blue-500">
            Create your first one.
          </a>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {myPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">
                  {post.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {post.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-slate-300">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublish.mutate({ id: post.id })}
                  disabled={togglePublish.isPending}
                  className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
                >
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => deletePost.mutate({ id: post.id })}
                  disabled={deletePost.isPending}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
