"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const inp =
  "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

export default function NewPostPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getMyPosts.invalidate();
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    createPost.mutate({ title, content });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Post</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4"
      >
        {createPost.error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {createPost.error.message}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inp}
            placeholder="Post title"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className={`${inp} resize-none`}
            placeholder="Write your post..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPost.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {createPost.isPending ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
