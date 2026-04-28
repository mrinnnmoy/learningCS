import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "@/app/components/DeletePostButton";

// Re-render this page after every Server Action that calls revalidatePath('/blog')
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
        <Link
          href="/blog/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No posts yet.</p>
          <Link
            href="/blog/new"
            className="text-blue-500 hover:underline mt-2 block"
          >
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>
                      {post._count.comments} comment
                      {post._count.comments !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <DeletePostButton postId={post.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
