import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AddCommentForm from "@/app/components/AddCommentForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — NextBlog`,
    description: post.content.slice(0, 155),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { comments: { orderBy: { createdAt: "desc" } } },
  });

  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">{post.title}</h1>
      <p className="text-sm text-slate-400 mb-8">
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      <hr className="my-10 border-slate-200" />

      {/* Comments list */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Comments ({post.comments.length})
        </h2>

        {post.comments.length === 0 ? (
          <p className="text-slate-400 italic">
            No comments yet — be the first!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{comment.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Client Component — needs interactivity for the form */}
        <AddCommentForm postId={post.id} />
      </section>
    </article>
  );
}
