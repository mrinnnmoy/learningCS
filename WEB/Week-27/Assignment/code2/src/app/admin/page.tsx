import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { logout } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function createPost(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  if (!title?.trim() || !body?.trim()) return;

  await prisma.post.create({
    data: {
      title: title.trim(),
      body: body.trim(),
    },
  });

  revalidateTag("posts");
}

async function togglePublish(id: number, published: boolean) {
  "use server";

  await prisma.post.update({
    where: { id },
    data: { published },
  });

  revalidateTag("posts");
}

async function deletePost(id: number) {
  "use server";

  await prisma.post.delete({
    where: { id },
  });

  revalidateTag("posts");
}

async function handleLogout() {
  "use server";

  await logout();
  redirect("/login");
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="py-10">Loading admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin</h1>

        <form action={handleLogout}>
          <button
            type="submit"
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </form>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">New Post</h2>

        <form action={createPost} className="flex flex-col gap-3">
          <input
            name="title"
            type="text"
            required
            placeholder="Post title"
            className="px-4 py-3 border border-slate-200 rounded-xl"
          />

          <textarea
            name="body"
            required
            rows={4}
            placeholder="Post content..."
            className="px-4 py-3 border border-slate-200 rounded-xl resize-none"
          />

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl px-6 self-start"
          >
            Create Post
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start justify-between border rounded-xl p-4"
            >
              <div>
                <p className="font-medium">{post.title}</p>

                <p className="text-xs text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()} ·{" "}
                  {post.published ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await togglePublish(post.id, !post.published);
                  }}
                >
                  <button type="submit" className="text-blue-500 text-xs">
                    {post.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await deletePost(post.id);
                  }}
                >
                  <button type="submit" className="text-red-500 text-xs">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
