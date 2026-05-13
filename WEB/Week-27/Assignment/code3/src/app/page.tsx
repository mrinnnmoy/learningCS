import { prisma } from "@/lib/prisma";
import { formatDate } from "./utils";

// use cache tells Next.js 16 to cache this entire component's output.
// cacheTag lets us invalidate it precisely with revalidateTag('posts').
async function getPosts() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag("posts");
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Blog</h1>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No posts yet.</p>
          <a
            href="/admin"
            className="text-blue-500 hover:underline text-sm mt-2 block"
          >
            Go to Admin to create one
          </a>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {posts.map((post) => (
            <article key={post.id} className="py-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {post.title}
              </h2>
              <time className="text-xs text-slate-400 mt-1 block">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <p className="text-slate-600 mt-3 leading-relaxed">{post.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
